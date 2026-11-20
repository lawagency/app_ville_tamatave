"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  Car,
  Contact,
  FileCheck2,
  Fingerprint,
  Hash,
  History,
  Layers3,
  NotebookPen,
  Palette,
  Pencil,
  Phone,
  ShieldCheck,
  Signature,
  Tag,
  UserCog,
  UserMinus,
  UserRound,
  UserRoundPen,
  type LucideIcon,
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
import Skeleton from "@/components/Skeleton";
import { Avatar, DataTable, StatusDot } from "@/components/ui";
import { api, fichierUrl, formatDate } from "@/lib/api";
import { afficherTelephone } from "@/lib/formats";
import { useAction } from "@/lib/useAction";
import {
  AUTORISATIONS_CIRCULATION,
  STATUTS_VEHICULE,
  VALIDATIONS,
  marqueModele,
  type AttributionChauffeur,
  type AutorisationCirculation,
  type HistoriqueStatutVehicule,
  type ProprieteVehicule,
  type StatutVehicule,
  type Vehicule,
} from "@/types";
import { useAuthStore, useVehiculesStore } from "@/stores";
import VehiculeFormModal from "./VehiculeFormModal";
import {
  ACTIONS_STATUT_VEHICULE,
  AttribuerChauffeurModal,
  ChangerProprietaireModal,
  ChangerStatutVehiculeModal,
  routesVehicule,
  type EspaceVehicule,
} from "./VehiculeModals";

type Onglet = "informations" | "historique" | "proprietaires" | "chauffeurs";
type Modale = "formulaire" | "proprietaire" | "chauffeur" | null;

const SOURCES: Record<ProprieteVehicule["source"], string> = {
  initiale: "Enregistrement",
  vente: "Vente",
  heritage: "Héritage",
  correction: "Correction",
};

function BadgeStatut({ statut }: { statut: StatutVehicule }) {
  const { label, tone } = STATUTS_VEHICULE[statut] ?? { label: statut, tone: "muted" };
  return <BadgeTon label={label} tone={tone} icon={ACTIONS_STATUT_VEHICULE[statut]?.icon} />;
}

/** « 12/03/2024 → aujourd'hui » */
const periode = (debut: string, fin: string | null) =>
  `${formatDate(debut)} → ${fin ? formatDate(fin) : "aujourd'hui"}`;

/** Historique chargé à l'ouverture de l'onglet (route de la mairie). */
function useHistorique<T>(url: string | null) {
  const [lignes, setLignes] = useState<T[] | null>(null);
  const [erreur, setErreur] = useState<string>();
  const charger = useCallback(() => {
    if (!url) return;
    api<T[]>(url)
      .then((l) => {
        setErreur(undefined);
        setLignes(l);
      })
      .catch((e: Error) => setErreur(e.message));
  }, [url]);
  useEffect(() => {
    charger();
  }, [charger]);
  return { lignes, erreur, charger };
}

/** Personne liée au véhicule dans le résumé : nom, lien, boutons. */
function Lie({
  nom,
  detail,
  href,
  icon: Icon,
  actions,
  vide,
}: {
  nom: string | null;
  detail?: string | null;
  href?: string;
  icon: LucideIcon;
  actions?: React.ReactNode;
  vide: string;
}) {
  return (
    <>
      {nom ? (
        <span className="inline-flex items-center gap-1.5 font-semibold">
          <Icon className="size-4 text-text-muted" />
          {href ? (
            <Link href={href} className="text-primary hover:underline">
              {nom}
            </Link>
          ) : (
            nom
          )}
          {detail && <span className="font-normal text-text-muted">· {detail}</span>}
        </span>
      ) : (
        <span className="text-text-muted">{vide}</span>
      )}
      {actions}
    </>
  );
}

const boutonLien =
  "inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline";

/**
 * Fiche d'un véhicule. `mairie` : tout (statut, propriétaire, historiques) ;
 * `proprietaire` : son véhicule, sa description et son chauffeur.
 */
export default function FicheVehicule({
  params,
  espace = "mairie",
}: {
  params: Promise<{ id: string }>;
  espace?: EspaceVehicule;
}) {
  const { id } = use(params);
  const mairie = espace === "mairie";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { chemin, store } = routesVehicule(espace);
  const retour = mairie ? "/admin/vehicules" : "/proprietaire/espace/vehicules";

  const peutModifier = useAuthStore((s) =>
    mairie
      ? s.user?.role === "super_admin" || s.user?.permissions?.vehicules?.modifier === true
      : s.user?.permissions?.mes_vehicules?.modifier === true,
  );

  const demande = searchParams.get("onglet");
  const onglet: Onglet =
    mairie && (demande === "historique" || demande === "proprietaires" || demande === "chauffeurs")
      ? demande
      : "informations";

  const [fiche, setFiche] = useState<Vehicule | null>(null);
  const [erreur, setErreur] = useState<string>();
  const [modale, setModale] = useState<Modale>(null);
  const [nouveauStatut, setNouveauStatut] = useState<StatutVehicule | null>(null);
  const action = useAction();

  const historique = useHistorique<HistoriqueStatutVehicule>(
    mairie ? `/vehicules/${id}/historique` : null,
  );
  const proprietes = useHistorique<ProprieteVehicule>(
    mairie ? `/vehicules/${id}/proprietes` : null,
  );
  const attributions = useHistorique<AttributionChauffeur>(
    mairie ? `/vehicules/${id}/attributions` : null,
  );

  const charger = useCallback(
    () =>
      api<Vehicule>(`${chemin}/${id}`)
        .then(setFiche)
        .catch((e: Error) => setErreur(e.message)),
    [chemin, id],
  );

  useEffect(() => {
    charger();
  }, [charger]);

  function changerOnglet(o: string) {
    router.replace(o === "informations" ? pathname : `${pathname}?onglet=${o}`, { scroll: false });
  }

  /** Après un changement : fiche à jour et historiques rechargés. */
  function apres(v: Vehicule) {
    setFiche(v);
    historique.charger();
    proprietes.charger();
    attributions.charger();
  }

  function changerAutorisation(autorisation: AutorisationCirculation) {
    return action.run(async () => {
      apres(
        await useVehiculesStore
          .getState()
          .update(Number(id), { autorisation_circulation: autorisation }),
      );
    }, `Autorisation de circuler : ${AUTORISATIONS_CIRCULATION[autorisation].label.toLowerCase()}`);
  }

  function retirerChauffeur() {
    return action.run(async () => {
      apres(await api<Vehicule>(`${chemin}/${id}/chauffeur`, "DELETE"));
      await store.getState().fetchAll({ force: true });
    }, "Le véhicule n'a plus de chauffeur");
  }

  if (erreur) {
    return (
      <div className="space-y-4">
        <Link href={retour} className="btn-ghost inline-flex items-center gap-2">
          <ArrowLeft className="size-4" />
          Retour aux véhicules
        </Link>
        <p className="alert-error">{erreur}</p>
      </div>
    );
  }
  if (!fiche) return <FicheSkeleton />;

  const autorisation = AUTORISATIONS_CIRCULATION[fiche.autorisation_circulation];

  const ONGLETS: OngletFiche<string>[] = [
    { key: "informations", label: "Informations", icon: Car },
    { key: "historique", label: "Historique", icon: History, count: historique.lignes?.length },
    {
      key: "proprietaires",
      label: "Propriétaires",
      icon: UserRound,
      count: proprietes.lignes?.length,
    },
    { key: "chauffeurs", label: "Chauffeurs", icon: Contact, count: attributions.lignes?.length },
    { key: "documents", label: "Documents", icon: FileCheck2, bientot: true },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête : identité du véhicule, statut et actions */}
      <section className="card p-0">
        <div className="flex flex-wrap items-center gap-4 p-6">
          <Link
            href={retour}
            aria-label="Retour aux véhicules"
            title="Retour aux véhicules"
            className="rounded-md p-2 text-text-muted transition-colors hover:bg-background hover:text-primary"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <PhotoAgrandie src={fichierUrl(fiche.photo_chemin)} alt={fiche.immatriculation}>
            <Avatar
              label={fiche.immatriculation}
              photo={fichierUrl(fiche.photo_chemin)}
              icon={<Car className="size-7" />}
              className="size-16 bg-primary/5 text-xl"
            />
          </PhotoAgrandie>
          <div className="min-w-0 flex-1">
            <h1 className="flex flex-wrap items-baseline gap-x-3 text-2xl font-bold text-text-main">
              <span className="font-mono tracking-wide">{fiche.immatriculation}</span>
              {fiche.nom && <span className="text-lg text-text-muted">« {fiche.nom} »</span>}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-muted">
              <code className="font-mono font-semibold text-primary">{fiche.identifiant}</code>
              {fiche.type_nom && (
                <span>
                  {fiche.type_nom}
                  {fiche.categorie_nom && ` · ${fiche.categorie_nom}`}
                </span>
              )}
              {marqueModele(fiche) && <span>{marqueModele(fiche)}</span>}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {mairie && peutModifier && (
              <>
                <label className="sr-only" htmlFor="statut-vehicule">
                  Statut du véhicule
                </label>
                <select
                  id="statut-vehicule"
                  value={fiche.statut}
                  // Le statut ne change qu'après la justification : la liste reste sur l'actuel
                  onChange={(e) => setNouveauStatut(e.target.value as StatutVehicule)}
                  className="input-field w-auto min-w-52 font-semibold text-primary"
                >
                  {(Object.keys(STATUTS_VEHICULE) as StatutVehicule[]).map((s) => (
                    <option key={s} value={s}>
                      {STATUTS_VEHICULE[s].label}
                    </option>
                  ))}
                </select>
              </>
            )}
            {peutModifier && (
              <button
                onClick={() => setModale("formulaire")}
                className="btn-ghost inline-flex items-center gap-2"
              >
                <Pencil className="size-4" />
                Modifier
              </button>
            )}
          </div>
        </div>

        {/* Résumé : statut, autorisation, propriétaire, chauffeur */}
        <dl className="grid gap-6 border-t border-border px-6 py-4 sm:grid-cols-2 lg:grid-cols-4">
          <Resume label="Statut">
            <BadgeStatut statut={fiche.statut} />
          </Resume>
          <Resume label="Autorisation de circuler">
            {mairie && peutModifier ? (
              <select
                aria-label="Autorisation de circuler"
                value={fiche.autorisation_circulation}
                disabled={action.pending}
                onChange={(e) => changerAutorisation(e.target.value as AutorisationCirculation)}
                className="rounded-md border border-border bg-surface px-2 py-1 text-sm font-semibold"
              >
                {(Object.keys(AUTORISATIONS_CIRCULATION) as AutorisationCirculation[]).map((a) => (
                  <option key={a} value={a}>
                    {AUTORISATIONS_CIRCULATION[a].label}
                  </option>
                ))}
              </select>
            ) : (
              <BadgeTon label={autorisation.label} tone={autorisation.tone} icon={ShieldCheck} />
            )}
          </Resume>
          <Resume label="Propriétaire">
            {mairie ? (
              <Lie
                nom={fiche.proprietaire_nom}
                detail={fiche.proprietaire_identifiant}
                href={
                  fiche.proprietaire_actuel_id
                    ? `/admin/proprietaires/${fiche.proprietaire_actuel_id}`
                    : undefined
                }
                icon={UserRound}
                vide="Aucun"
                actions={
                  peutModifier && (
                    <button onClick={() => setModale("proprietaire")} className={boutonLien}>
                      <UserRoundPen className="size-3.5" />
                      {fiche.proprietaire_actuel_id ? "Changer" : "Attribuer"}
                    </button>
                  )
                }
              />
            ) : (
              <span className="font-semibold">Vous</span>
            )}
          </Resume>
          <Resume label="Chauffeur">
            <Lie
              nom={fiche.chauffeur_nom}
              detail={fiche.chauffeur_type_nom}
              href={
                fiche.chauffeur_actuel_id
                  ? mairie
                    ? `/admin/chauffeurs/${fiche.chauffeur_actuel_id}`
                    : `/proprietaire/espace/chauffeurs/${fiche.chauffeur_actuel_id}`
                  : undefined
              }
              icon={Contact}
              vide="Aucun"
              actions={
                peutModifier && (
                  <>
                    <button onClick={() => setModale("chauffeur")} className={boutonLien}>
                      <UserCog className="size-3.5" />
                      {fiche.chauffeur_actuel_id ? "Changer" : "Attribuer"}
                    </button>
                    {fiche.chauffeur_actuel_id && (
                      <button
                        onClick={retirerChauffeur}
                        disabled={action.pending}
                        className={`${boutonLien} text-danger`}
                      >
                        <UserMinus className="size-3.5" />
                        Retirer
                      </button>
                    )}
                  </>
                )
              }
            />
          </Resume>
        </dl>
      </section>

      {mairie && <OngletsFiche onglets={ONGLETS} value={onglet} onChange={changerOnglet} />}

      {onglet === "informations" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Carte titre="Caractéristiques" icon={Car}>
            <dl className="grid gap-6 p-6 sm:grid-cols-2">
              <Info label="Immatriculation" valeur={fiche.immatriculation} icon={Hash} />
              <Info label="Nom du véhicule" valeur={fiche.nom} icon={Signature} />
              <Info label="Type" valeur={fiche.type_nom} icon={Tag} />
              <Info label="Catégorie" valeur={fiche.categorie_nom} icon={Layers3} />
              <Info label="Marque et modèle" valeur={marqueModele(fiche)} icon={Car} />
              <Info label="Couleur" valeur={fiche.couleur} icon={Palette} />
              <Info label="Numéro de châssis" valeur={fiche.numero_chassis} icon={Fingerprint} />
              <Info
                label="1re mise en circulation"
                valeur={
                  fiche.date_premiere_circulation && formatDate(fiche.date_premiere_circulation)
                }
                icon={Calendar}
              />
              <Info
                label="Enregistré le"
                valeur={formatDate(fiche.date_enregistrement ?? fiche.created_at)}
                icon={CalendarDays}
              />
            </dl>
          </Carte>

          <Carte titre="Propriétaire et chauffeur" icon={UserRound}>
            <dl className="grid gap-6 p-6 sm:grid-cols-2">
              <Info
                label="Propriétaire"
                valeur={mairie ? fiche.proprietaire_nom : "Vous"}
                icon={UserRound}
              />
              <Info
                label="Téléphone"
                valeur={mairie ? afficherTelephone(fiche.proprietaire_telephone) : null}
                icon={Phone}
              />
              <Info label="Chauffeur" valeur={fiche.chauffeur_nom} icon={Contact} />
              <Info
                label="Téléphone du chauffeur"
                valeur={afficherTelephone(fiche.chauffeur_telephone)}
                icon={Phone}
              />
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
      )}

      {onglet === "historique" && (
        <HistoriqueStatuts
          historique={historique.lignes}
          erreur={historique.erreur}
          badge={(s) => <BadgeStatut statut={s} />}
          tonDe={(s) => STATUTS_VEHICULE[s]?.tone ?? "muted"}
          vide={`Le véhicule est « ${STATUTS_VEHICULE[fiche.statut].label.toLowerCase()} » depuis son enregistrement.`}
        />
      )}

      {onglet === "proprietaires" &&
        (proprietes.erreur ? (
          <p className="alert-error">{proprietes.erreur}</p>
        ) : !proprietes.lignes ? (
          <Skeleton className="h-40" />
        ) : (
          <DataTable
            rows={proprietes.lignes}
            columns={[
              {
                label: "Propriétaire",
                render: (p) => (
                  <Link
                    href={`/admin/proprietaires/${p.proprietaire_id}`}
                    className="font-medium hover:text-primary hover:underline"
                  >
                    {p.proprietaire_nom}{" "}
                    <span className="font-mono text-xs text-text-muted">
                      {p.proprietaire_identifiant}
                    </span>
                  </Link>
                ),
              },
              { label: "Période", render: (p) => periode(p.date_debut, p.date_fin) },
              { label: "Origine", render: (p) => SOURCES[p.source] ?? p.source },
              {
                label: "Validation",
                render: (p) => {
                  const { label, tone } = VALIDATIONS[p.statut_validation];
                  return <StatusDot tone={tone} label={label} />;
                },
              },
              { label: "Validé par", render: (p) => p.valide_par_nom ?? "—" },
              {
                label: "",
                align: "right",
                render: (p) => (p.actif ? <BadgeTon label="Actuel" tone="success" /> : null),
              },
            ]}
          />
        ))}

      {onglet === "chauffeurs" &&
        (attributions.erreur ? (
          <p className="alert-error">{attributions.erreur}</p>
        ) : !attributions.lignes ? (
          <Skeleton className="h-40" />
        ) : (
          <DataTable
            rows={attributions.lignes}
            columns={[
              {
                label: "Chauffeur",
                render: (a) => (
                  <Link
                    href={`/admin/chauffeurs/${a.chauffeur_id}`}
                    className="font-medium hover:text-primary hover:underline"
                  >
                    {a.chauffeur_nom}{" "}
                    <span className="font-mono text-xs text-text-muted">
                      {a.chauffeur_identifiant}
                    </span>
                  </Link>
                ),
              },
              { label: "Type de chauffeur", render: (a) => a.chauffeur_type_nom ?? "—" },
              { label: "Période", render: (a) => periode(a.date_debut, a.date_fin) },
              {
                label: "Validation",
                render: (a) => {
                  const { label, tone } = VALIDATIONS[a.statut_validation];
                  return <StatusDot tone={tone} label={label} />;
                },
              },
              { label: "Validé par", render: (a) => a.valide_par_nom ?? "—" },
              {
                label: "",
                align: "right",
                render: (a) => (a.actif ? <BadgeTon label="Actuel" tone="success" /> : null),
              },
            ]}
          />
        ))}

      {modale === "formulaire" && (
        <VehiculeFormModal
          vehicule={fiche}
          espace={espace}
          onClose={() => setModale(null)}
          // La réponse de la photo ne contient pas les jointures : on relit la fiche
          onSaved={() => charger()}
        />
      )}
      {modale === "proprietaire" && (
        <ChangerProprietaireModal vehicule={fiche} onClose={() => setModale(null)} onDone={apres} />
      )}
      {modale === "chauffeur" && (
        <AttribuerChauffeurModal
          vehicule={fiche}
          espace={espace}
          onClose={() => setModale(null)}
          onDone={apres}
        />
      )}
      {nouveauStatut && nouveauStatut !== fiche.statut && (
        <ChangerStatutVehiculeModal
          vehicule={fiche}
          statut={nouveauStatut}
          onClose={() => setNouveauStatut(null)}
          onDone={apres}
        />
      )}
    </div>
  );
}
