"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
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
  ShieldBan,
  ShieldCheck,
  Tag,
  UserRound,
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
import {
  STATUTS_CHAUFFEUR,
  STATUTS_PROFESSIONNELS,
  type Chauffeur,
  type HistoriqueStatutChauffeur,
  type StatutChauffeur,
  type StatutProfessionnel,
} from "@/types";
import { toast, useChauffeursStore } from "@/stores";
import ChauffeurFormModal from "./ChauffeurFormModal";
import {
  ACTIONS_STATUT_CHAUFFEUR,
  ChangerStatutChauffeurModal,
  ListeNoireModal,
  nomChauffeur,
} from "./ChauffeurStatutModals";

type Onglet = "informations" | "historique";

function BadgeStatut({ statut }: { statut: StatutChauffeur }) {
  const { label, tone } = STATUTS_CHAUFFEUR[statut];
  return <BadgeTon label={label} tone={tone} icon={ACTIONS_STATUT_CHAUFFEUR[statut].icon} />;
}

/** Fiche détaillée d'un chauffeur (administration). */
export default function FicheChauffeur({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const onglet: Onglet =
    searchParams.get("onglet") === "historique" ? "historique" : "informations";

  const [fiche, setFiche] = useState<Chauffeur | null>(null);
  const [erreur, setErreur] = useState<string>();
  const [historique, setHistorique] = useState<HistoriqueStatutChauffeur[] | null>(null);
  const [erreurHistorique, setErreurHistorique] = useState<string>();
  const [edition, setEdition] = useState<{ avecCompte: boolean } | null>(null);
  const [nouveauStatut, setNouveauStatut] = useState<StatutChauffeur | null>(null);
  const [listeNoire, setListeNoire] = useState(false);
  const [situationEnCours, setSituationEnCours] = useState(false);

  const charger = useCallback(
    () =>
      api<Chauffeur>(`/chauffeurs/${id}`)
        .then(setFiche)
        .catch((e: Error) => setErreur(e.message)),
    [id],
  );

  const chargerHistorique = useCallback(() => {
    api<HistoriqueStatutChauffeur[]>(`/chauffeurs/${id}/historique`)
      .then((lignes) => {
        setErreurHistorique(undefined);
        setHistorique(lignes);
      })
      .catch((e: Error) => setErreurHistorique(e.message));
  }, [id]);

  useEffect(() => {
    charger();
    chargerHistorique();
  }, [charger, chargerHistorique]);

  function changerOnglet(o: string) {
    if (o !== "informations" && o !== "historique") return;
    router.replace(o === "informations" ? pathname : `${pathname}?onglet=${o}`, { scroll: false });
  }

  /** Situation de travail : pas de justification, pas d'historique côté API. */
  async function changerSituation(situation: StatutProfessionnel) {
    setSituationEnCours(true);
    try {
      setFiche(
        await useChauffeursStore.getState().update(Number(id), { statut_professionnel: situation }),
      );
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSituationEnCours(false);
    }
  }

  if (erreur) {
    return (
      <div className="space-y-4">
        <Link href="/admin/chauffeurs" className="btn-ghost inline-flex items-center gap-2">
          <ArrowLeft className="size-4" />
          Retour aux chauffeurs
        </Link>
        <p className="alert-error">{erreur}</p>
      </div>
    );
  }
  if (!fiche) return <FicheSkeleton />;

  const nom = nomChauffeur(fiche);

  const ONGLETS: OngletFiche<string>[] = [
    { key: "informations", label: "Informations", icon: UserRound },
    { key: "historique", label: "Historique", icon: History, count: historique?.length },
    { key: "vehicules", label: "Véhicules conduits", icon: Car, bientot: true },
    { key: "documents", label: "Documents", icon: FileCheck2, bientot: true },
  ];

  return (
    <div className="space-y-6">
      {fiche.est_blackliste && (
        <div className="alert-error flex flex-wrap items-start gap-3">
          <ShieldBan className="mt-0.5 size-5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-bold">
              Sur liste noire
              {fiche.date_blacklist && ` depuis le ${formatDate(fiche.date_blacklist)}`}
            </p>
            {fiche.raison_blacklist && (
              <p className="mt-1 whitespace-pre-line text-sm">{fiche.raison_blacklist}</p>
            )}
          </div>
          <button
            onClick={() => setListeNoire(true)}
            className="btn-ghost inline-flex items-center gap-2 bg-surface"
          >
            <ShieldCheck className="size-4" />
            Retirer
          </button>
        </div>
      )}

      {/* En-tête : identité, statut et actions */}
      <section className="card p-0">
        <div className="flex flex-wrap items-center gap-4 p-6">
          <Link
            href="/admin/chauffeurs"
            aria-label="Retour aux chauffeurs"
            title="Retour aux chauffeurs"
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
              <span>Enregistré le {formatDate(fiche.date_enregistrement ?? fiche.created_at)}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="statut-fiche">
              Statut de la fiche
            </label>
            <select
              id="statut-fiche"
              value={fiche.statut}
              // Le statut ne change qu'après la justification : la liste reste sur l'actuel
              onChange={(e) => setNouveauStatut(e.target.value as StatutChauffeur)}
              className="input-field w-auto min-w-52 font-semibold text-primary"
            >
              {(Object.keys(STATUTS_CHAUFFEUR) as StatutChauffeur[]).map((s) => (
                <option key={s} value={s}>
                  {STATUTS_CHAUFFEUR[s].label}
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
            {!fiche.est_blackliste && (
              <button
                onClick={() => setListeNoire(true)}
                title="Mettre sur liste noire"
                aria-label="Mettre sur liste noire"
                className="btn-ghost px-3 text-danger"
              >
                <ShieldBan className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Résumé : statut, situation, compte, contact */}
        <dl className="grid gap-6 border-t border-border px-6 py-4 sm:grid-cols-2 lg:grid-cols-4">
          <Resume label="Statut de la fiche">
            <BadgeStatut statut={fiche.statut} />
          </Resume>
          <Resume label="Situation">
            {fiche.est_blackliste ? (
              <BadgeTon label="Liste noire" tone="danger" icon={ShieldBan} />
            ) : (
              <select
                aria-label="Situation du chauffeur"
                value={fiche.statut_professionnel}
                disabled={situationEnCours}
                onChange={(e) => changerSituation(e.target.value as StatutProfessionnel)}
                className="rounded-md border border-border bg-surface px-2 py-1 text-xs font-semibold"
              >
                {(Object.keys(STATUTS_PROFESSIONNELS) as StatutProfessionnel[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUTS_PROFESSIONNELS[s].label}
                  </option>
                ))}
              </select>
            )}
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
            <span className="font-semibold">{afficherTelephone(fiche.telephone) || "—"}</span>
          </Resume>
        </dl>
      </section>

      <OngletsFiche onglets={ONGLETS} value={onglet} onChange={changerOnglet} />

      {onglet === "informations" ? (
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
              <Info label="Véhicule conduit" valeur={fiche.type_vehicule_nom} icon={Car} />
              <Info label="Téléphone" valeur={afficherTelephone(fiche.telephone)} icon={Phone} />
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
      ) : (
        <HistoriqueStatuts
          historique={historique}
          erreur={erreurHistorique}
          badge={(s) => <BadgeStatut statut={s} />}
          tonDe={(s) => STATUTS_CHAUFFEUR[s]?.tone ?? "muted"}
          vide={`La fiche est ${STATUTS_CHAUFFEUR[fiche.statut].label.toLowerCase()} depuis son enregistrement.`}
        />
      )}

      {edition && (
        <ChauffeurFormModal
          chauffeur={fiche}
          avecCompte={edition.avecCompte}
          onClose={() => setEdition(null)}
          // La réponse de la photo ne contient pas les jointures : on relit la fiche
          onSaved={() => charger()}
        />
      )}

      {nouveauStatut && nouveauStatut !== fiche.statut && (
        <ChangerStatutChauffeurModal
          chauffeur={fiche}
          statut={nouveauStatut}
          onClose={() => setNouveauStatut(null)}
          onDone={(f) => {
            setFiche(f);
            chargerHistorique();
          }}
        />
      )}

      {listeNoire && (
        <ListeNoireModal chauffeur={fiche} onClose={() => setListeNoire(false)} onDone={setFiche} />
      )}
    </div>
  );
}
