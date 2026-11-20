"use client";

import { Layers } from "lucide-react";
import FormModal, { FormSection } from "@/components/FormModal";
import { Field } from "@/components/ui";
import { useAction } from "@/lib/useAction";
import type { SousTypeDocument, TypeDocument } from "@/types";
import { useSousTypesDocumentsStore } from "@/stores";

type Props = {
  types: TypeDocument[];
  /** `null` : création. */
  sousType: SousTypeDocument | null;
  /** Type choisi d'office à la création (ligne du type, filtre…). */
  typeId?: number | string;
  onClose: () => void;
};

/**
 * Création / modification d'un sous-type de document.
 * À monter seulement quand il est ouvert : ses champs partent des props.
 */
export default function SousTypeFormModal({ types, sousType: editing, typeId, onClose }: Props) {
  const sousTypes = useSousTypesDocumentsStore();
  const enregistrement = useAction();
  const typeFixe = !editing && typeId ? types.find((t) => String(t.id) === String(typeId)) : null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const saisie = new FormData(e.currentTarget);
    const body = {
      type_document_id: Number(saisie.get("type_document_id")),
      nom: String(saisie.get("nom") ?? "").trim(),
      description: String(saisie.get("description") ?? "").trim(),
      actif: saisie.get("actif") === "on",
    };
    const ok = await enregistrement.run(
      () => (editing ? sousTypes.update(editing.id, body) : sousTypes.create(body)),
      editing ? `Sous-type « ${body.nom} » modifié` : `Sous-type « ${body.nom} » créé`,
    );
    if (ok) onClose();
  }

  return (
    <FormModal
      size="sm"
      open
      title={editing ? "Modifier le sous-type" : "Nouveau sous-type de document"}
      subtitle={
        editing?.nom ??
        (typeFixe
          ? `Pour « ${typeFixe.nom} »`
          : "Catégorie de permis (A, B, C…), formule d'assurance…")
      }
      onClose={onClose}
      onSubmit={onSubmit}
      submitLabel={editing ? "Enregistrer" : "Créer"}
      pending={enregistrement.pending}
      formKey={editing?.id ?? `nouveau-${typeId ?? ""}`}
    >
      <FormSection title="Sous-type" icon={Layers} columns={1}>
        <Field label="Type de document *">
          <select
            name="type_document_id"
            required
            defaultValue={editing ? String(editing.type_document_id) : String(typeId ?? "")}
            className="input-field"
          >
            <option value="" disabled>
              Choisir un type…
            </option>
            {types.map((t) => (
              <option key={t.id} value={String(t.id)}>
                {t.nom}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Nom *">
          <input
            name="nom"
            required
            defaultValue={editing?.nom}
            placeholder="B"
            className="input-field"
          />
        </Field>
        <Field label="Description">
          <textarea
            name="description"
            rows={3}
            defaultValue={editing?.description ?? ""}
            placeholder="Véhicules légers jusqu'à 3,5 t"
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
          Sous-type actif
        </label>
      </FormSection>
    </FormModal>
  );
}
