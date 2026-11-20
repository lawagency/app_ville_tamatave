"use client";

import { useState } from "react";
import { Contact, Pencil, Plus, Power, Trash2 } from "lucide-react";
import FormModal from "@/components/FormModal";
import { ConfirmDialog } from "@/components/Modal";
import { ActifDot, CellTitle, DataTable, Field, RowActions } from "@/components/ui";
import { useAction } from "@/lib/useAction";
import type { TypeChauffeur, TypeVehicule } from "@/types";
import { useTypesChauffeursStore } from "@/stores";

type Props = {
  /** Types de véhicules proposés dans le formulaire. */
  typesVehicules: TypeVehicule[];
  onglets: React.ReactNode;
};

/** Types de chauffeurs, chacun rattaché à un type de véhicule (« Joker » → cyclo-pousse). */
export default function TypesChauffeursTab({ typesVehicules, onglets }: Props) {
  const types = useTypesChauffeursStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TypeChauffeur | null>(null);
  const [deleting, setDeleting] = useState<TypeChauffeur | null>(null);
  const enregistrement = useAction();
  const action = useAction();

  // Un type de véhicule désactivé reste proposé s'il est déjà choisi
  const vehiculesProposes = typesVehicules.filter(
    (v) => v.actif || Number(v.id) === Number(editing?.type_vehicule_id),
  );

  function ouvrir(t: TypeChauffeur | null) {
    setEditing(t);
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
      type_vehicule_id: Number(saisie.get("type_vehicule_id")),
      nom: String(saisie.get("nom") ?? "").trim(),
      description: String(saisie.get("description") ?? "").trim(),
      actif: saisie.get("actif") === "on",
    };
    const ok = await enregistrement.run(
      () => (editing ? types.update(editing.id, body) : types.create(body)),
      `Type « ${body.nom} » ${editing ? "modifié" : "créé"}`,
    );
    if (ok) fermer();
  }

  function basculer(t: TypeChauffeur) {
    return action.run(
      () => types.update(t.id, { actif: !t.actif }),
      `« ${t.nom} » ${t.actif ? "désactivé" : "activé"}`,
    );
  }

  async function onDelete() {
    if (!deleting) return;
    const ok = await action.run(
      () => types.remove(deleting.id),
      `Type « ${deleting.nom} » supprimé`,
    );
    if (ok) fermer();
  }

  return (
    <>
      <DataTable
        loading={types.loading}
        error={types.error}
        rows={types.items}
        toolbar={
          <div className="flex flex-wrap items-center justify-between gap-4">
            {onglets}
            <button onClick={() => ouvrir(null)} className="btn-primary flex items-center gap-2">
              <Plus className="size-4" />
              Nouveau type de chauffeur
            </button>
          </div>
        }
        columns={[
          {
            label: "Nom",
            render: (t) => (
              <CellTitle
                title={t.nom}
                subtitle={t.description || undefined}
                icon={<Contact className="size-5" />}
              />
            ),
          },
          { label: "Type de véhicule", render: (t) => t.type_vehicule_nom },
          {
            label: "Chauffeurs",
            render: (t) => <span className="font-semibold">{t.nombre_chauffeurs}</span>,
          },
          { label: "Statut", render: (t) => <ActifDot actif={t.actif} /> },
          {
            label: "Actions",
            align: "right",
            render: (t) => (
              <RowActions
                actions={[
                  { label: "Modifier", icon: Pencil, onClick: () => ouvrir(t) },
                  {
                    label: t.actif ? "Désactiver" : "Activer",
                    icon: Power,
                    variant: t.actif ? undefined : "success",
                    onClick: () => basculer(t),
                  },
                  {
                    label: "Supprimer",
                    icon: Trash2,
                    variant: "danger",
                    // ON DELETE RESTRICT : l'API refuse tant que des chauffeurs l'utilisent
                    disabled: t.nombre_chauffeurs > 0,
                    hint: "Des chauffeurs l'utilisent : désactivez-le",
                    onClick: () => setDeleting(t),
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
        title={editing ? "Modifier le type de chauffeur" : "Nouveau type de chauffeur"}
        subtitle={editing?.nom}
        onClose={fermer}
        onSubmit={onSubmit}
        submitLabel={editing ? "Enregistrer" : "Créer"}
        pending={enregistrement.pending}
        formKey={editing?.id ?? "nouveau"}
      >
        <Field label="Type de véhicule *">
          <select
            name="type_vehicule_id"
            required
            defaultValue={editing?.type_vehicule_id ?? ""}
            className="input-field"
          >
            <option value="" disabled>
              {vehiculesProposes.length ? "Choisir…" : "Aucun type de véhicule"}
            </option>
            {vehiculesProposes.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nom}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Nom *">
          <input
            name="nom"
            required
            defaultValue={editing?.nom}
            placeholder="Joker, titulaire…"
            className="input-field"
          />
        </Field>
        <Field label="Description">
          <textarea
            name="description"
            rows={2}
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
          Actif
        </label>
      </FormModal>

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer le type de chauffeur"
        message={
          <>
            Supprimer <strong>{deleting?.nom}</strong> ?
          </>
        }
        onConfirm={onDelete}
        onClose={fermer}
      />
    </>
  );
}
