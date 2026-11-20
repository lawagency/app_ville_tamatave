"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, KeyRound, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/Modal";
import ChangerStatutModal, {
  ACTIONS_STATUT,
  statutDe,
} from "@/components/proprietaires/ChangerStatutModal";
import ProprietaireFormModal from "@/components/proprietaires/ProprietaireFormModal";
import StatutBadge from "@/components/users/StatutBadge";
import { CellTitle, DataTable, PageHeader, RowActions, StatusDot } from "@/components/ui";
import { fichierUrl, formatDate } from "@/lib/api";
import { afficherTelephone, chiffres, formaterCin } from "@/lib/formats";
import { useAction } from "@/lib/useAction";
import { STATUTS_FICHE, type Proprietaire, type StatutFiche } from "@/types";
import { useProprietairesStore, useUiStore } from "@/stores";

type Formulaire = { proprietaire: Proprietaire | null; avecCompte: boolean };

export default function ProprietairesPage() {
  const router = useRouter();
  const proprietaires = useProprietairesStore();
  const search = useUiStore((s) => s.proprietaireSearch);
  const setSearch = useUiStore((s) => s.setProprietaireSearch);

  const [formulaire, setFormulaire] = useState<Formulaire | null>(null);
  const [deleting, setDeleting] = useState<Proprietaire | null>(null);
  const [changement, setChangement] = useState<{
    proprietaire: Proprietaire;
    statut: StatutFiche;
  } | null>(null);
  const suppression = useAction();

  useEffect(() => {
    useProprietairesStore.getState().fetchAll();
  }, []);

  const q = search.trim().toLowerCase();
  const rows = proprietaires.items.filter((p) =>
    [p.identifiant, p.nom, p.prenom, p.telephone_principal, p.cin].some(
      (v) =>
        v?.toLowerCase().includes(q) ||
        // Recherche par chiffres : « 034 12 », « 3012456 »… quel que soit le format saisi
        (chiffres(q).length >= 3 && v?.replace(/\D/g, "").includes(chiffres(q).replace(/^0/, ""))),
    ),
  );

  const nomDe = (p: Proprietaire) => `${p.prenom} ${p.nom.toUpperCase()}`;
  const ficheDe = (p: Proprietaire) => `/admin/proprietaires/${p.id}`;

  async function onDelete() {
    if (!deleting) return;
    const ok = await suppression.run(
      () => proprietaires.remove(deleting.id),
      `Propriétaire ${nomDe(deleting)} supprimé`,
    );
    if (ok) setDeleting(null);
  }

  return (
    <>
      <PageHeader
        title="Propriétaires"
        subtitle="Propriétaires de véhicules enregistrés"
        action={
          <button
            onClick={() => setFormulaire({ proprietaire: null, avecCompte: false })}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="size-4" />
            Nouveau propriétaire
          </button>
        }
      />

      <DataTable
        loading={proprietaires.loading}
        error={proprietaires.error}
        rows={rows}
        onRowClick={(p) => router.push(ficheDe(p))}
        toolbar={
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, identifiant, CIN ou téléphone…"
              className="input-field pl-9"
            />
          </div>
        }
        columns={[
          {
            label: "Propriétaire",
            render: (p) => (
              // Lien en plus du clic sur la ligne : ouverture dans un nouvel onglet possible
              <Link
                href={ficheDe(p)}
                onClick={(e) => e.stopPropagation()}
                className="block hover:[&_p:first-child]:text-primary"
              >
                <CellTitle
                  title={nomDe(p)}
                  subtitle={<code>{p.identifiant}</code>}
                  photo={fichierUrl(p.photo_chemin)}
                />
              </Link>
            ),
          },
          { label: "Téléphone", render: (p) => afficherTelephone(p.telephone_principal) },
          { label: "CIN", render: (p) => formaterCin(p.cin) || "—" },
          {
            // Statut du compte de connexion (users.statut)
            label: "Compte",
            render: (p) =>
              p.user_id ? (
                <StatutBadge statut={p.compte_statut ?? "actif"} />
              ) : (
                <StatusDot tone="muted" label="Pas de compte" />
              ),
          },
          {
            // Statut de la fiche (proprietaires.statut)
            label: "Statut",
            render: (p) => {
              const { label, tone } = STATUTS_FICHE[statutDe(p)];
              return <StatusDot tone={tone} label={label} />;
            },
          },
          { label: "Enregistré le", render: (p) => formatDate(p.created_at) },
          {
            label: "Actions",
            align: "right",
            render: (p) => (
              <RowActions
                actions={[
                  { label: "Voir la fiche", icon: Eye, onClick: () => router.push(ficheDe(p)) },
                  {
                    label: "Créer son compte",
                    icon: KeyRound,
                    variant: "success",
                    visible: !p.user_id,
                    onClick: () => setFormulaire({ proprietaire: p, avecCompte: true }),
                  },
                  {
                    label: "Modifier",
                    icon: Pencil,
                    onClick: () => setFormulaire({ proprietaire: p, avecCompte: false }),
                  },
                  ...(Object.keys(ACTIONS_STATUT) as StatutFiche[]).map((statut) => ({
                    ...ACTIONS_STATUT[statut],
                    visible: statut !== statutDe(p),
                    onClick: () => setChangement({ proprietaire: p, statut }),
                  })),
                  {
                    label: "Supprimer",
                    icon: Trash2,
                    variant: "danger",
                    onClick: () => setDeleting(p),
                  },
                ]}
              />
            ),
          },
        ]}
      />

      {formulaire && (
        <ProprietaireFormModal
          key={formulaire.proprietaire?.id ?? "nouveau"}
          proprietaire={formulaire.proprietaire}
          avecCompte={formulaire.avecCompte}
          onClose={() => setFormulaire(null)}
        />
      )}

      {changement && (
        <ChangerStatutModal
          proprietaire={changement.proprietaire}
          statut={changement.statut}
          onClose={() => setChangement(null)}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer le propriétaire"
        message={
          <>
            Supprimer <strong>{deleting && nomDe(deleting)}</strong> ? Cette action est définitive.
          </>
        }
        onConfirm={onDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
