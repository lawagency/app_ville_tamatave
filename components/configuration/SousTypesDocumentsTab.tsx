"use client";

import { useState } from "react";
import { Layers, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/Modal";
import { ActifDot, CellTitle, DataTable, RowActions } from "@/components/ui";
import { useAction } from "@/lib/useAction";
import type { SousTypeDocument, TypeDocument } from "@/types";
import { useSousTypesDocumentsStore } from "@/stores";
import SousTypeFormModal from "./SousTypeFormModal";

type Props = {
  types: TypeDocument[];
  onglets: React.ReactNode;
};

export default function SousTypesDocumentsTab({ types, onglets }: Props) {
  const sousTypes = useSousTypesDocumentsStore();
  const [filtre, setFiltre] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SousTypeDocument | null>(null);
  const [deleting, setDeleting] = useState<SousTypeDocument | null>(null);
  const action = useAction();

  const rows = filtre
    ? sousTypes.items.filter((s) => String(s.type_document_id) === filtre)
    : sousTypes.items;
  const nomDuType = (s: SousTypeDocument) =>
    s.type_document_nom ?? types.find((t) => String(t.id) === String(s.type_document_id))?.nom;

  function ouvrir(sousType: SousTypeDocument | null) {
    setEditing(sousType);
    setFormOpen(true);
  }

  function fermer() {
    setFormOpen(false);
    setDeleting(null);
  }

  function basculer(s: SousTypeDocument) {
    return action.run(
      () => sousTypes.update(s.id, { actif: !s.actif }),
      `« ${s.nom} » ${s.actif ? "désactivé" : "activé"}`,
    );
  }

  async function onDelete() {
    if (!deleting) return;
    const ok = await action.run(
      () => sousTypes.remove(deleting.id),
      `Sous-type « ${deleting.nom} » supprimé`,
    );
    if (ok) fermer();
  }

  return (
    <>
      <DataTable
        loading={sousTypes.loading}
        error={sousTypes.error}
        rows={rows}
        toolbar={
          <div className="flex flex-wrap items-center justify-between gap-4">
            {onglets}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={filtre}
                onChange={(e) => setFiltre(e.target.value)}
                aria-label="Filtrer par type de document"
                className="input-field w-auto"
              >
                <option value="">Tous les types de documents</option>
                {types.map((t) => (
                  <option key={t.id} value={String(t.id)}>
                    {t.nom}
                  </option>
                ))}
              </select>
              <button
                onClick={() => ouvrir(null)}
                disabled={types.length === 0}
                title={types.length === 0 ? "Créez d'abord un type de document" : undefined}
                className="btn-primary flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="size-4" />
                Nouveau sous-type
              </button>
            </div>
          </div>
        }
        columns={[
          {
            label: "Nom",
            render: (s) => <CellTitle title={s.nom} icon={<Layers className="size-5" />} />,
          },
          {
            label: "Type de document",
            render: (s) => (
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {nomDuType(s) ?? "—"}
              </span>
            ),
          },
          {
            label: "Description",
            render: (s) => (
              <span className="block max-w-xs truncate" title={s.description ?? undefined}>
                {s.description || "—"}
              </span>
            ),
          },
          { label: "Statut", render: (s) => <ActifDot actif={s.actif} /> },
          {
            label: "Actions",
            align: "right",
            render: (s) => (
              <RowActions
                actions={[
                  { label: "Modifier", icon: Pencil, onClick: () => ouvrir(s) },
                  {
                    label: s.actif ? "Désactiver" : "Activer",
                    icon: Power,
                    variant: s.actif ? undefined : "success",
                    onClick: () => basculer(s),
                  },
                  {
                    label: "Supprimer",
                    icon: Trash2,
                    variant: "danger",
                    onClick: () => setDeleting(s),
                  },
                ]}
              />
            ),
          },
        ]}
      />

      {formOpen && (
        <SousTypeFormModal
          types={types}
          sousType={editing}
          typeId={filtre}
          onClose={() => setFormOpen(false)}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer le sous-type"
        message={
          <>
            Supprimer <strong>{deleting?.nom}</strong>
            {deleting && nomDuType(deleting) ? ` (${nomDuType(deleting)})` : ""} ?
          </>
        }
        onConfirm={onDelete}
        onClose={fermer}
      />
    </>
  );
}
