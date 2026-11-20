"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, KeyRound, Pencil, Plus, Search, ShieldBan, ShieldCheck, Trash2 } from "lucide-react";
import ChauffeurFormModal from "@/components/chauffeurs/ChauffeurFormModal";
import {
  ACTIONS_STATUT_CHAUFFEUR,
  ChangerStatutChauffeurModal,
  ListeNoireModal,
  nomChauffeur,
} from "@/components/chauffeurs/ChauffeurStatutModals";
import { ConfirmDialog } from "@/components/Modal";
import StatutBadge from "@/components/users/StatutBadge";
import { CellTitle, DataTable, FilterTabs, PageHeader, RowActions, StatusDot } from "@/components/ui";
import { fichierUrl } from "@/lib/api";
import { afficherTelephone, chiffres } from "@/lib/formats";
import { useAction } from "@/lib/useAction";
import {
  STATUTS_CHAUFFEUR,
  STATUTS_PROFESSIONNELS,
  type Chauffeur,
  type StatutChauffeur,
} from "@/types";
import { useChauffeursStore } from "@/stores";

type Formulaire = { chauffeur: Chauffeur | null; avecCompte: boolean };
type Filtre = "tous" | "actif" | "en_attente" | "liste_noire";

const FILTRES: Record<Filtre, (c: Chauffeur) => boolean> = {
  tous: () => true,
  actif: (c) => c.statut === "actif",
  en_attente: (c) => c.statut === "en_attente_verification" || c.statut === "dossier_incomplet",
  liste_noire: (c) => c.est_blackliste,
};

export default function ChauffeursPage() {
  const router = useRouter();
  const chauffeurs = useChauffeursStore();
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState<Filtre>("tous");
  const [formulaire, setFormulaire] = useState<Formulaire | null>(null);
  const [deleting, setDeleting] = useState<Chauffeur | null>(null);
  const [changement, setChangement] = useState<{
    chauffeur: Chauffeur;
    statut: StatutChauffeur;
  } | null>(null);
  const [listeNoire, setListeNoire] = useState<Chauffeur | null>(null);
  const suppression = useAction();

  useEffect(() => {
    useChauffeursStore.getState().fetchAll();
  }, []);

  const q = search.trim().toLowerCase();
  const trouves = chauffeurs.items.filter((c) =>
    [c.identifiant, c.nom, c.prenom, c.telephone, c.cin, c.type_chauffeur_nom].some(
      (v) =>
        v?.toLowerCase().includes(q) ||
        // Recherche par chiffres : « 034 12 », « 3012456 »… quel que soit le format saisi
        (chiffres(q).length >= 3 && v?.replace(/\D/g, "").includes(chiffres(q).replace(/^0/, ""))),
    ),
  );
  const rows = trouves.filter(FILTRES[filtre]);
  const compte = (f: Filtre) => trouves.filter(FILTRES[f]).length;

  const ficheDe = (c: Chauffeur) => `/admin/chauffeurs/${c.id}`;

  async function onDelete() {
    if (!deleting) return;
    const ok = await suppression.run(
      () => chauffeurs.remove(deleting.id),
      `Chauffeur ${nomChauffeur(deleting)} supprimé`,
    );
    if (ok) setDeleting(null);
  }

  return (
    <>
      <PageHeader
        title="Chauffeurs"
        subtitle="Chauffeurs enregistrés et ce qu'ils conduisent"
        action={
          <button
            onClick={() => setFormulaire({ chauffeur: null, avecCompte: false })}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="size-4" />
            Nouveau chauffeur
          </button>
        }
      />

      <DataTable
        loading={chauffeurs.loading}
        error={chauffeurs.error}
        rows={rows}
        onRowClick={(c) => router.push(ficheDe(c))}
        rowClassName={(c) => (c.est_blackliste ? "row-suppression" : "")}
        toolbar={
          <div className="flex flex-wrap items-center justify-between gap-4">
            <FilterTabs
              value={filtre}
              onChange={setFiltre}
              tabs={[
                { key: "tous", label: "Tous", count: compte("tous"), tone: "primary" },
                { key: "actif", label: "Validés", count: compte("actif"), tone: "success" },
                {
                  key: "en_attente",
                  label: "À vérifier",
                  count: compte("en_attente"),
                  tone: "warning",
                },
                {
                  key: "liste_noire",
                  label: "Liste noire",
                  count: compte("liste_noire"),
                  tone: "danger",
                },
              ]}
            />
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nom, identifiant, CIN, téléphone ou type…"
                className="input-field pl-9"
              />
            </div>
          </div>
        }
        columns={[
          {
            label: "Chauffeur",
            render: (c) => (
              // Lien en plus du clic sur la ligne : ouverture dans un nouvel onglet possible
              <Link
                href={ficheDe(c)}
                onClick={(e) => e.stopPropagation()}
                className="block hover:[&_p:first-child]:text-primary"
              >
                <CellTitle
                  title={nomChauffeur(c)}
                  subtitle={<code>{c.identifiant}</code>}
                  photo={fichierUrl(c.photo_chemin)}
                />
              </Link>
            ),
          },
          {
            label: "Type",
            render: (c) =>
              c.type_chauffeur_nom ? (
                <div>
                  <p className="font-medium">{c.type_chauffeur_nom}</p>
                  <p className="text-xs text-text-muted">{c.type_vehicule_nom}</p>
                </div>
              ) : (
                <span className="text-text-muted">—</span>
              ),
          },
          { label: "Téléphone", render: (c) => afficherTelephone(c.telephone) || "—" },
          {
            label: "Compte",
            render: (c) =>
              c.user_id ? (
                <StatutBadge statut={c.compte_statut ?? "actif"} />
              ) : (
                <StatusDot tone="muted" label="Pas de compte" />
              ),
          },
          {
            label: "Statut",
            render: (c) => {
              const { label, tone } = STATUTS_CHAUFFEUR[c.statut];
              return <StatusDot tone={tone} label={label} />;
            },
          },
          {
            label: "Situation",
            render: (c) => {
              if (c.est_blackliste) return <StatusDot tone="danger" label="Liste noire" />;
              const { label, tone } = STATUTS_PROFESSIONNELS[c.statut_professionnel];
              return <StatusDot tone={tone} label={label} />;
            },
          },
          {
            label: "Actions",
            align: "right",
            render: (c) => (
              <RowActions
                actions={[
                  { label: "Voir la fiche", icon: Eye, onClick: () => router.push(ficheDe(c)) },
                  {
                    label: "Créer son compte",
                    icon: KeyRound,
                    variant: "success",
                    visible: !c.user_id,
                    onClick: () => setFormulaire({ chauffeur: c, avecCompte: true }),
                  },
                  {
                    label: "Modifier",
                    icon: Pencil,
                    onClick: () => setFormulaire({ chauffeur: c, avecCompte: false }),
                  },
                  ...(Object.keys(ACTIONS_STATUT_CHAUFFEUR) as StatutChauffeur[]).map(
                    (statut) => ({
                      ...ACTIONS_STATUT_CHAUFFEUR[statut],
                      visible: statut !== c.statut,
                      onClick: () => setChangement({ chauffeur: c, statut }),
                    }),
                  ),
                  c.est_blackliste
                    ? {
                        label: "Retirer de la liste noire",
                        icon: ShieldCheck,
                        variant: "success" as const,
                        onClick: () => setListeNoire(c),
                      }
                    : {
                        label: "Mettre sur liste noire",
                        icon: ShieldBan,
                        variant: "danger" as const,
                        onClick: () => setListeNoire(c),
                      },
                  {
                    label: "Supprimer",
                    icon: Trash2,
                    variant: "danger",
                    onClick: () => setDeleting(c),
                  },
                ]}
              />
            ),
          },
        ]}
      />

      {formulaire && (
        <ChauffeurFormModal
          key={formulaire.chauffeur?.id ?? "nouveau"}
          chauffeur={formulaire.chauffeur}
          avecCompte={formulaire.avecCompte}
          onClose={() => setFormulaire(null)}
        />
      )}

      {changement && (
        <ChangerStatutChauffeurModal
          chauffeur={changement.chauffeur}
          statut={changement.statut}
          onClose={() => setChangement(null)}
        />
      )}

      {listeNoire && <ListeNoireModal chauffeur={listeNoire} onClose={() => setListeNoire(null)} />}

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer le chauffeur"
        message={
          <>
            Supprimer <strong>{deleting && nomChauffeur(deleting)}</strong> ? Cette action est
            définitive.
          </>
        }
        onConfirm={onDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
