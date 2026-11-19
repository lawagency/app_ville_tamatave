"use client";

import { useState } from "react";
import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
import FormModal, { FormSection } from "@/components/FormModal";
import { ConfirmDialog } from "@/components/Modal";
import { ActifDot, CellTitle, DataTable, Field, RowActions } from "@/components/ui";
import { useAction } from "@/lib/useAction";
import type { CategorieService, UniteControle } from "@/types";
import { useCategoriesServicesStore } from "@/stores";

type CategoriesTabProps = {
  unites: UniteControle[];
  onglets: React.ReactNode;
};

export default function CategoriesTab({ unites, onglets }: CategoriesTabProps) {
  const categories = useCategoriesServicesStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CategorieService | null>(null);
  const [deleting, setDeleting] = useState<CategorieService | null>(null);
  const enregistrement = useAction();
  const suppression = useAction();

  const nbUnites = (c: CategorieService) =>
    unites.filter((u) => String(u.type_corps_id) === String(c.id)).length;

  function ouvrir(categorie: CategorieService | null) {
    setEditing(categorie);
    setFormOpen(true);
  }

  function fermer() {
    setFormOpen(false);
    setDeleting(null);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const saisie = new FormData(e.currentTarget);
    const body = {
      nom: String(saisie.get("nom") ?? "").trim(),
      description: String(saisie.get("description") ?? "").trim(),
      actif: saisie.get("actif") === "on",
    };
    const ok = await enregistrement.run(
      () => (editing ? categories.update(editing.id, body) : categories.create(body)),
      editing ? `Catégorie « ${body.nom} » modifiée` : `Catégorie « ${body.nom} » créée`,
    );
    if (ok) fermer();
  }

  async function onDelete() {
    if (!deleting) return;
    const ok = await suppression.run(
      () => categories.remove(deleting.id),
      `Catégorie « ${deleting.nom} » supprimée`,
    );
    if (ok) fermer();
  }

  return (
    <>
      <DataTable
        loading={categories.loading}
        error={categories.error}
        rows={categories.items}
        toolbar={
          <div className="flex flex-wrap items-center justify-between gap-4">
            {onglets}
            <button onClick={() => ouvrir(null)} className="btn-primary flex items-center gap-2">
              <Plus className="size-4" />
              Ajouter une catégorie
            </button>
          </div>
        }
        columns={[
          {
            label: "Nom",
            render: (c) => <CellTitle title={c.nom} icon={<Tags className="size-5" />} />,
          },
          {
            label: "Description",
            render: (c) => (
              <span className="block max-w-xs truncate" title={c.description ?? undefined}>
                {c.description || "—"}
              </span>
            ),
          },
          {
            label: "Unités",
            render: (c) => `${nbUnites(c)} unité${nbUnites(c) > 1 ? "s" : ""}`,
          },
          { label: "Statut", render: (c) => <ActifDot actif={c.actif} /> },
          {
            label: "Actions",
            align: "right",
            render: (c) => (
              <RowActions
                actions={[
                  { label: "Modifier", icon: Pencil, onClick: () => ouvrir(c) },
                  {
                    label: "Supprimer",
                    icon: Trash2,
                    variant: "danger",
                    disabled: nbUnites(c) > 0,
                    hint: "Des unités utilisent cette catégorie",
                    onClick: () => setDeleting(c),
                  },
                ]}
              />
            ),
          },
        ]}
      />

      <FormModal
        size="sm"
        open={formOpen}
        title={editing ? "Modifier la catégorie" : "Nouvelle catégorie de service"}
        subtitle={editing?.nom ?? "Police, gendarmerie, service municipal…"}
        onClose={fermer}
        onSubmit={onSubmit}
        submitLabel={editing ? "Enregistrer" : "Créer"}
        pending={enregistrement.pending}
        formKey={editing?.id ?? "nouvelle"}
      >
        <FormSection title="Catégorie" icon={Tags} columns={1}>
          <Field label="Nom *">
            <input
              name="nom"
              required
              defaultValue={editing?.nom}
              placeholder="Police nationale"
              className="input-field"
            />
          </Field>
          <Field label="Description">
            <textarea
              name="description"
              rows={3}
              defaultValue={editing?.description ?? ""}
              className="input-field"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="actif"
              defaultChecked={editing?.actif ?? true}
              className="size-4 accent-primary"
            />
            Catégorie active
          </label>
        </FormSection>
      </FormModal>

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer la catégorie"
        message={
          <>
            Supprimer la catégorie <strong>{deleting?.nom}</strong> ?
          </>
        }
        onConfirm={onDelete}
        onClose={fermer}
      />
    </>
  );
}
