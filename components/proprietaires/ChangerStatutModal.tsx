"use client";

import {
  Ban,
  CircleCheck,
  CircleMinus,
  CircleX,
  Clock,
  FileWarning,
  type LucideIcon,
} from "lucide-react";
import FormModal from "@/components/FormModal";
import { Field } from "@/components/ui";
import { useAction } from "@/lib/useAction";
import { STATUTS_FICHE, type Proprietaire, type StatutFiche } from "@/types";
import { useProprietairesStore } from "@/stores";

/** Action qui fait passer la fiche à ce statut (menus, liste déroulante). */
export const ACTIONS_STATUT: Record<
  StatutFiche,
  { label: string; icon: LucideIcon; variant?: "success" | "danger" }
> = {
  actif: { label: "Valider la fiche", icon: CircleCheck, variant: "success" },
  en_verification: { label: "Remettre en vérification", icon: Clock },
  dossier_incomplet: { label: "Dossier incomplet", icon: FileWarning },
  suspendu: { label: "Suspendre", icon: Ban, variant: "danger" },
  inactif: { label: "Désactiver", icon: CircleMinus },
  radie: { label: "Radier", icon: CircleX, variant: "danger" },
};

export const statutDe = (p: Proprietaire): StatutFiche => p.statut ?? "en_verification";

type Props = {
  proprietaire: Proprietaire;
  statut: StatutFiche;
  onClose: () => void;
  onDone?: (fiche: Proprietaire) => void;
};

/** Changement de statut d'une fiche, avec la justification gardée dans l'historique. */
export default function ChangerStatutModal({ proprietaire, statut, onClose, onDone }: Props) {
  const update = useProprietairesStore((s) => s.update);
  const changement = useAction();
  const nom = `${proprietaire.prenom} ${proprietaire.nom.toUpperCase()}`;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // La justification est obligatoire : elle va dans l'historique des statuts
    const justification = String(new FormData(e.currentTarget).get("justification") ?? "").trim();
    let fiche: Proprietaire | null = null;
    const ok = await changement.run(
      async () => {
        fiche = await update(proprietaire.id, { statut, justification_statut: justification });
      },
      `Fiche de ${nom} : ${STATUTS_FICHE[statut].label.toLowerCase()}`,
    );
    if (ok && fiche) {
      onDone?.(fiche);
      onClose();
    }
  }

  return (
    <FormModal
      size="sm"
      open
      title={ACTIONS_STATUT[statut].label}
      subtitle={`${nom} : ${STATUTS_FICHE[statutDe(proprietaire)].label} → ${STATUTS_FICHE[statut].label}`}
      onClose={onClose}
      onSubmit={onSubmit}
      submitLabel="Changer le statut"
      pending={changement.pending}
      formKey={`${proprietaire.id}-${statut}`}
    >
      <Field label="Justification *">
        <textarea
          name="justification"
          rows={3}
          required
          placeholder="Raison du changement, conservée dans l'historique de la fiche"
          className="input-field"
        />
      </Field>
    </FormModal>
  );
}
