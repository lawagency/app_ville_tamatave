"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  Car,
  FileCheck2,
  History,
  IdCard,
  KeyRound,
  Mail,
  MapPin,
  NotebookPen,
  Pencil,
  Phone,
  PhoneCall,
  UserRound,
  VenusAndMars,
} from "lucide-react";
import {
  BadgeTon,
  Carte,
  FicheSkeleton,
  HistoriqueStatuts,
  Info,
  OngletsFiche,
  Resume,
  type OngletFiche,
} from "@/components/fiche/FicheElements";
import PhotoAgrandie from "@/components/PhotoAgrandie";
import StatutBadge from "@/components/users/StatutBadge";
import { Avatar } from "@/components/ui";
import { api, fichierUrl, formatDate } from "@/lib/api";
import { afficherTelephone, formaterCin } from "@/lib/formats";
import VehiculesLies, { useVehiculesLies } from "@/components/vehicules/VehiculesLies";
import { peutVoir } from "@/lib/espaces";
import { STATUTS_FICHE, type HistoriqueStatut, type Proprietaire, type StatutFiche } from "@/types";
import { useAuthStore } from "@/stores";
import ChangerStatutModal, { ACTIONS_STATUT, statutDe } from "./ChangerStatutModal";
import ProprietaireFormModal from "./ProprietaireFormModal";

export { FicheSkeleton };

type Onglet = "informations" | "historique" | "vehicules";

/** Badge coloré du statut de la fiche. */
function BadgeStatut({ statut }: { statut: StatutFiche }) {
  const { label, tone } = STATUTS_FICHE[statut];
  return <BadgeTon label={label} tone={tone} icon={ACTIONS_STATUT[statut].icon} />;
}

/** Fiche détaillée d'un propriétaire (administration). */
export default function FicheProprietaire({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const voitVehicules = useAuthStore((s) => peutVoir(s.user, "vehicules"));
  const demande = searchParams.get("onglet");
  const onglet: Onglet =
    demande === "historique" || (demande === "vehicules" && voitVehicules)
      ? demande
      : "informations";
  const { vehicules, erreur: erreurVehicules } = useVehiculesLies(
    "proprietaire_id",
    id,
    voitVehicules,
  );

  const [fiche, setFiche] = useState<Proprietaire | null>(null);
  const [erreur, setErreur] = useState<string>();
  const [historique, setHistorique] = useState<HistoriqueStatut[] | null>(null);
  const [erreurHistorique, setErreurHistorique] = useState<string>();
  const [edition, setEdition] = useState<{ avecCompte: boolean } | null>(null);
  const [nouveauStatut, setNouveauStatut] = useState<StatutFiche | null>(null);

  const chargerHistorique = useCallback(() => {
    api<HistoriqueStatut[]>(`/proprietaires/${id}/historique`)
      .then((lignes) => {
        setErreurHistorique(undefined);
        setHistorique(lignes);
      })
      .catch((e: Error) => setErreurHistorique(e.message));
  }, [id]);

  useEffect(() => {
    api<Proprietaire>(`/proprietaires/${id}`)
      .then(setFiche)
      .catch((e: Error) => setErreur(e.message));
    chargerHistorique();
  }, [id, chargerHistorique]);

  function changerOnglet(o: string) {
    if (o !== "informations" && o !== "historique" && o !== "vehicules") return;
    router.replace(o === "informations" ? pathname : `${pathname}?onglet=${o}`, { scroll: false });
  }

  if (erreur) {
    return (
      <div className="space-y-4">
        <Link href="/admin/proprietaires" className="btn-ghost inline-flex items-center gap-2">
          <ArrowLeft className="size-4" />
          Retour aux propriétaires
        </Link>
        <p className="alert-error">{erreur}</p>
      </div>
    );
  }
  if (!fiche) return <FicheSkeleton />;

  const statut = statutDe(fiche);
  const nom = `${fiche.prenom} ${fiche.nom.toUpperCase()}`;

  const ONGLETS: OngletFiche<string>[] = [
    { key: "informations", label: "Informations", icon: UserRound },
    { key: "historique", label: "Historique", icon: History, count: historique?.length },
    {
      key: "vehicules",
      label: "Véhicules",
      icon: Car,
      count: vehicules?.length,
      bientot: !voitVehicules,
    },
    { key: "documents", label: "Documents", icon: FileCheck2, bientot: true },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête : identité, statut et actions */}
      <section className="card p-0">
        <div className="flex flex-wrap items-center gap-4 p-6">
          <Link
            href="/admin/proprietaires"
            aria-label="Retour aux propriétaires"
            title="Retour aux propriétaires"
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
              <span>Enregistré le {formatDate(fiche.created_at)}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="statut-fiche">
              Statut de la fiche
            </label>
            <select
              id="statut-fiche"
              value={statut}
              // Le statut ne change qu'après la justification : la liste reste sur l'actuel
              onChange={(e) => setNouveauStatut(e.target.value as StatutFiche)}
              className="input-field w-auto min-w-52 font-semibold text-primary"
            >
              {(Object.keys(STATUTS_FICHE) as StatutFiche[]).map((s) => (
                <option key={s} value={s}>
                  {STATUTS_FICHE[s].label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setEdition({ avecCompte: false })}
              className="btn-ghost inline-flex items-center gap-2"
            >
              <Pencil className="size-4" />
              Modifier
            </button>
          </div>
        </div>

        {/* Résumé : statut de la fiche, compte d'accès, contact */}
        <dl className="grid gap-6 border-t border-border px-6 py-4 sm:grid-cols-3">
          <Resume label="Statut de la fiche">
            <BadgeStatut statut={statut} />
          </Resume>
          <Resume label="Compte">
            {fiche.user_id ? (
              <>
                <StatutBadge statut={fiche.compte_statut ?? "actif"} />
                <span className="text-text-muted">{fiche.compte_email}</span>
              </>
            ) : (
              <>
                <span className="text-text-muted">Pas de compte</span>
                <button
                  onClick={() => setEdition({ avecCompte: true })}
                  className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                >
                  <KeyRound className="size-3.5" />
                  Créer son compte
                </button>
              </>
            )}
          </Resume>
          <Resume label="Téléphone">
            <span className="font-semibold">
              {afficherTelephone(fiche.telephone_principal) || "—"}
            </span>
          </Resume>
        </dl>
      </section>

      {/* Onglets : les sections à venir (véhicules, documents…) s'ajoutent ici */}
      <OngletsFiche onglets={ONGLETS} value={onglet} onChange={changerOnglet} />

      {onglet === "informations" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Carte titre="Identité" icon={UserRound}>
            <dl className="grid gap-6 p-6 sm:grid-cols-2">
              <Info label="Nom" valeur={fiche.nom.toUpperCase()} icon={UserRound} />
              <Info label="Prénom" valeur={fiche.prenom} icon={UserRound} />
              <Info label="CIN" valeur={formaterCin(fiche.cin)} icon={IdCard} />
              <Info
                label="Sexe"
                valeur={fiche.sexe === "M" ? "Masculin" : fiche.sexe === "F" ? "Féminin" : null}
                icon={VenusAndMars}
              />
              <Info
                label="Date de naissance"
                valeur={fiche.date_naissance && formatDate(fiche.date_naissance)}
                icon={CalendarDays}
              />
              <Info label="Lieu de naissance" valeur={fiche.lieu_naissance} icon={MapPin} />
              <Info label="Profession" valeur={fiche.profession} icon={Briefcase} />
            </dl>
          </Carte>

          <Carte titre="Coordonnées" icon={Phone}>
            <dl className="grid gap-6 p-6 sm:grid-cols-2">
              <Info
                label="Téléphone principal"
                valeur={afficherTelephone(fiche.telephone_principal)}
                icon={Phone}
              />
              <Info
                label="Téléphone secondaire"
                valeur={afficherTelephone(fiche.telephone_secondaire)}
                icon={PhoneCall}
              />
              <Info label="Email" valeur={fiche.email} icon={Mail} />
              <Info label="Adresse" valeur={fiche.adresse} icon={MapPin} />
            </dl>
          </Carte>

          <Carte titre="Notes" icon={NotebookPen} className="lg:col-span-2">
            <p
              className={`whitespace-pre-line p-6 text-sm ${fiche.notes ? "" : "text-text-muted"}`}
            >
              {fiche.notes || "Aucune note."}
            </p>
          </Carte>
        </div>
      ) : onglet === "vehicules" ? (
        <VehiculesLies vehicules={vehicules} erreur={erreurVehicules} masquer="proprietaire" />
      ) : (
        <HistoriqueStatuts
          historique={historique}
          erreur={erreurHistorique}
          badge={(s) => <BadgeStatut statut={s} />}
          tonDe={(s) => STATUTS_FICHE[s]?.tone ?? "muted"}
          vide={`La fiche est ${STATUTS_FICHE[statut].label.toLowerCase()} depuis son enregistrement.`}
        />
      )}

      {edition && (
        <ProprietaireFormModal
          proprietaire={fiche}
          avecCompte={edition.avecCompte}
          onClose={() => setEdition(null)}
          onSaved={() =>
            // La réponse de la photo ne contient pas les jointures du compte
            api<Proprietaire>(`/proprietaires/${id}`).then(setFiche)
          }
        />
      )}

      {nouveauStatut && nouveauStatut !== statut && (
        <ChangerStatutModal
          proprietaire={fiche}
          statut={nouveauStatut}
          onClose={() => setNouveauStatut(null)}
          onDone={(f) => {
            setFiche(f);
            chargerHistorique();
          }}
        />
      )}
    </div>
  );
}
