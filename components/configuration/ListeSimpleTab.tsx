"use client";

import { useState } from "react";
import { Pencil, Plus, Power, Trash2, type LucideIcon } from "lucide-react";
import FormModal from "@/components/FormModal";
import { ConfirmDialog } from "@/components/Modal";
import { ActifDot, CellTitle, DataTable, Field, RowActions } from "@/components/ui";
import { formatDate } from "@/lib/api";
import { useAction } from "@/lib/useAction";
import type { CrudState } from "@/stores/createCrudStore";
import type { ElementSimple } from "@/types";

/** Libellés d'une liste : « type de véhicule », « Nouveau type »… */
export type LibellesListe = {
  /** Au singulier, sans article : « type de véhicule ». */
  nom: string;
  /** « Nouveau type de véhicule » / « Nouvelle catégorie… » */
  nouveau: string;
  /** Exemple affiché dans le champ Nom. */
  exemple: string;
  /** Ce que devient un véhicule lié quand l'élément est supprimé. */
  suppression: string;
  /** Accords : « la catégorie … créée ». */
  feminin?: boolean;
};

type Props = {
  store: CrudState<ElementSimple>;
  libelles: LibellesListe;
  icon: LucideIcon;
  onglets: React.ReactNode;
};

/** Liste de paramétrage à un seul champ (nom + actif) : types et catégories de véhicules. */
export default function ListeSimpleTab({ store, libelles, icon: Icon, onglets }: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ElementSimple | null>(null);
  const [deleting, setDeleting] = useState<ElementSimple | null>(null);
  const enregistrement = useAction();
  const action = useAction();
  const Nom = libelles.nom.charAt(0).toUpperCase() + libelles.nom.slice(1);
  const le = libelles.feminin ? "la" : "le";
  const e = libelles.feminin ? "e" : "";

  function ouvrir(element: ElementSimple | null) {
    setEditing(element);
    setFormOpen(true);
  }

  function fermer() {
    setFormOpen(false);
    setDeleting(null);
  }

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const saisie = new FormData(ev.currentTarget);
    const body = {
      nom: String(saisie.get("nom") ?? "").trim(),
      actif: saisie.get("actif") === "on",
    };
    const ok = await enregistrement.run(
      () => (editing ? store.update(editing.id, body) : store.create(body)),
      `${Nom} « ${body.nom} » ${editing ? "modifié" : "créé"}${e}`,
    );
    if (ok) fermer();
  }

  function basculer(el: ElementSimple) {
    return action.run(
      () => store.update(el.id, { actif: !el.actif }),
      `« ${el.nom} » ${el.actif ? "désactivé" : "activé"}${e}`,
    );
  }

  async function onDelete() {
    if (!deleting) return;
    const ok = await action.run(
      () => store.remove(deleting.id),
      `${Nom} « ${deleting.nom} » supprimé${e}`,
    );
    if (ok) fermer();
  }

  return (
    <>
      <DataTable
        loading={store.loading}
        error={store.error}
        rows={store.items}
        toolbar={
          <div className="flex flex-wrap items-center justify-between gap-4">
            {onglets}
            <button onClick={() => ouvrir(null)} className="btn-primary flex items-center gap-2">
              <Plus className="size-4" />
              {libelles.nouveau}
            </button>
          </div>
        }
        columns={[
          {
            label: "Nom",
            render: (el) => <CellTitle title={el.nom} icon={<Icon className="size-5" />} />,
          },
          { label: "Statut", render: (el) => <ActifDot actif={el.actif} /> },
          { label: "Créé le", render: (el) => formatDate(el.created_at) },
          {
            label: "Actions",
            align: "right",
            render: (el) => (
              <RowActions
                actions={[
                  { label: "Modifier", icon: Pencil, onClick: () => ouvrir(el) },
                  {
                    label: el.actif ? "Désactiver" : "Activer",
                    icon: Power,
                    variant: el.actif ? undefined : "success",
                    onClick: () => basculer(el),
                  },
                  {
                    label: "Supprimer",
                    icon: Trash2,
                    variant: "danger",
                    onClick: () => setDeleting(el),
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
        title={editing ? `Modifier ${le} ${libelles.nom}` : libelles.nouveau}
        subtitle={editing?.nom}
        onClose={fermer}
        onSubmit={onSubmit}
        submitLabel={editing ? "Enregistrer" : "Créer"}
        pending={enregistrement.pending}
        formKey={editing?.id ?? "nouveau"}
      >
        <Field label="Nom *">
          <input
            name="nom"
            required
            defaultValue={editing?.nom}
            placeholder={libelles.exemple}
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
          Actif
        </label>
      </FormModal>

      <ConfirmDialog
        open={deleting !== null}
        title={`Supprimer ${le} ${libelles.nom}`}
        message={
          <>
            Supprimer <strong>{deleting?.nom}</strong> ? {libelles.suppression}
          </>
        }
        onConfirm={onDelete}
        onClose={fermer}
      />
    </>
  );
}
