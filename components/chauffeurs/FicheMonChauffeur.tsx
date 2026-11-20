"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Car,
  IdCard,
  Mail,
  MapPin,
  NotebookPen,
  Pencil,
  Phone,
  ShieldBan,
  Tag,
  UserMinus,
  UserRound,
} from "lucide-react";
import { BadgeTon, Carte, FicheSkeleton, Info, Resume } from "@/components/fiche/FicheElements";
import { ConfirmDialog } from "@/components/Modal";
import PhotoAgrandie from "@/components/PhotoAgrandie";
import { Avatar } from "@/components/ui";
import { api, fichierUrl, formatDate } from "@/lib/api";
import { afficherTelephone, formaterCin } from "@/lib/formats";
import { useAction } from "@/lib/useAction";
import { STATUTS_CHAUFFEUR, type Chauffeur } from "@/types";
import { useAuthStore, useMesChauffeursStore } from "@/stores";
import ChauffeurFormModal from "./ChauffeurFormModal";
import { ACTIONS_STATUT_CHAUFFEUR, nomChauffeur } from "./ChauffeurStatutModals";
import SituationChauffeur from "./SituationChauffeur";

const RETOUR = "/proprietaire/espace/chauffeurs";

/** Fiche d'un chauffeur du propriétaire connecté (espace propriétaire). */
export default function FicheMonChauffeur({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const droits = useAuthStore((s) => s.user?.permissions?.mes_chauffeurs);
  const [fiche, setFiche] = useState<Chauffeur | null>(null);
  const [erreur, setErreur] = useState<string>();
  const [edition, setEdition] = useState(false);
  const [retrait, setRetrait] = useState(false);
  const action = useAction();

  const charger = useCallback(
    () =>
      api<Chauffeur>(`/chauffeurs/mes-chauffeurs/${id}`)
        .then(setFiche)
        .catch((e: Error) => setErreur(e.message)),
    [id],
  );

  useEffect(() => {
    charger();
  }, [charger]);

  async function onRetrait() {
    if (!fiche) return;
    const ok = await action.run(
      () => useMesChauffeursStore.getState().remove(fiche.id),
      `${nomChauffeur(fiche)} retiré de vos chauffeurs`,
    );
    if (ok) router.replace(RETOUR);
  }

  if (erreur) {
    return (
      <div className="space-y-4">
        <Link href={RETOUR} className="btn-ghost inline-flex items-center gap-2">
          <ArrowLeft className="size-4" />
          Retour à mes chauffeurs
        </Link>
        <p className="alert-error">{erreur}</p>
      </div>
    );
  }
  if (!fiche) return <FicheSkeleton />;

  const nom = nomChauffeur(fiche);
  const statut = STATUTS_CHAUFFEUR[fiche.statut];

  return (
    <div className="space-y-6">
      {fiche.est_blackliste && (
        <div className="alert-error flex items-start gap-3">
          <ShieldBan className="mt-0.5 size-5 shrink-0" />
          <div className="min-w-0">
            <p className="font-bold">
              Mis sur liste noire par la mairie
              {fiche.date_blacklist && ` le ${formatDate(fiche.date_blacklist)}`}
            </p>
            {fiche.raison_blacklist && (
              <p className="mt-1 whitespace-pre-line text-sm">{fiche.raison_blacklist}</p>
            )}
            <p className="mt-1 text-sm">
              Il ne peut pas être remis en service. Contactez la mairie.
            </p>
          </div>
        </div>
      )}

      {/* En-tête : identité et actions */}
      <section className="card p-0">
        <div className="flex flex-wrap items-center gap-4 p-6">
          <Link
            href={RETOUR}
            aria-label="Retour à mes chauffeurs"
            title="Retour à mes chauffeurs"
            className="rounded-md p-2 text-text-muted transition-colors hover:bg-background hover:text-primary"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <PhotoAgrandie src={fichierUrl(fiche.photo_chemin)} alt={nom}>
            <Avatar
              label={nom}
              photo={fichierUrl(fiche.photo_chemin)}
              className="size-16 bg-primary/5 text-xl"
            />
          </PhotoAgrandie>
          <div className="min-w-0 flex-1">
            <h1 className="break-words text-2xl font-bold text-text-main">{nom}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-muted">
              <code className="font-mono font-semibold text-primary">{fiche.identifiant}</code>
              {fiche.type_chauffeur_nom && (
                <span>
                  {fiche.type_chauffeur_nom} · {fiche.type_vehicule_nom}
                </span>
              )}
              <span>Ajouté le {formatDate(fiche.date_enregistrement ?? fiche.created_at)}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {droits?.modifier && (
              <button
                onClick={() => setEdition(true)}
                className="btn-ghost inline-flex items-center gap-2"
              >
                <Pencil className="size-4" />
                Modifier
              </button>
            )}
            {droits?.supprimer && (
              <button
                onClick={() => setRetrait(true)}
                title="Retirer de mes chauffeurs"
                aria-label="Retirer de mes chauffeurs"
                className="btn-ghost px-3 text-danger"
              >
                <UserMinus className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Résumé : fiche (mairie), situation (propriétaire), contact */}
        <dl className="grid gap-6 border-t border-border px-6 py-4 sm:grid-cols-3">
          <Resume label="Fiche (mairie)">
            <BadgeTon
              label={statut.label}
              tone={statut.tone}
              icon={ACTIONS_STATUT_CHAUFFEUR[fiche.statut].icon}
            />
          </Resume>
          <Resume label="Situation">
            <SituationChauffeur
              chauffeur={fiche}
              modifiable={droits?.modifier === true}
              onChange={setFiche}
            />
          </Resume>
          <Resume label="Téléphone">
            <span className="font-semibold">{afficherTelephone(fiche.telephone) || "—"}</span>
          </Resume>
        </dl>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Carte titre="Identité" icon={UserRound}>
          <dl className="grid gap-6 p-6 sm:grid-cols-2">
            <Info label="Nom" valeur={fiche.nom.toUpperCase()} icon={UserRound} />
            <Info label="Prénom" valeur={fiche.prenom} icon={UserRound} />
            <Info label="CIN" valeur={formaterCin(fiche.cin)} icon={IdCard} />
            <Info
              label="Date de naissance"
              valeur={fiche.date_naissance && formatDate(fiche.date_naissance)}
              icon={CalendarDays}
            />
            <Info label="Lieu de naissance" valeur={fiche.lieu_naissance} icon={MapPin} />
          </dl>
        </Carte>

        <Carte titre="Conduite et contact" icon={Phone}>
          <dl className="grid gap-6 p-6 sm:grid-cols-2">
            <Info label="Type de chauffeur" valeur={fiche.type_chauffeur_nom} icon={Tag} />
            {/* Type de véhicule du type de chauffeur, pas un véhicule attribué */}
            <Info label="Type de véhicule" valeur={fiche.type_vehicule_nom} icon={Car} />
            <Info label="Téléphone" valeur={afficherTelephone(fiche.telephone)} icon={Phone} />
            <Info label="Email" valeur={fiche.email} icon={Mail} />
            <Info label="Adresse" valeur={fiche.adresse} icon={MapPin} />
          </dl>
        </Carte>

        <Carte titre="Notes" icon={NotebookPen} className="lg:col-span-2">
          <p className={`whitespace-pre-line p-6 text-sm ${fiche.notes ? "" : "text-text-muted"}`}>
            {fiche.notes || "Aucune note."}
          </p>
        </Carte>
      </div>

      {edition && (
        <ChauffeurFormModal
          espace="proprietaire"
          chauffeur={fiche}
          onClose={() => setEdition(false)}
          // La réponse de la photo ne contient pas les jointures : on relit la fiche
          onSaved={() => charger()}
        />
      )}

      <ConfirmDialog
        open={retrait}
        title="Retirer le chauffeur"
        message={
          <>
            Retirer <strong>{nom}</strong> de vos chauffeurs ? Sa fiche reste enregistrée à la
            mairie.
          </>
        }
        onConfirm={onRetrait}
        onClose={() => setRetrait(false)}
      />
    </div>
  );
}
