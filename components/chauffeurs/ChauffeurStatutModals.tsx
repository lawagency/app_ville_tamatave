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
import { api } from "@/lib/api";
import { useAction } from "@/lib/useAction";
import { STATUTS_CHAUFFEUR, type Chauffeur, type StatutChauffeur } from "@/types";
import { useChauffeursStore } from "@/stores";

/** Action qui fait passer la fiche à ce statut (menus, liste déroulante). */
export const ACTIONS_STATUT_CHAUFFEUR: Record<
  StatutChauffeur,
  { label: string; icon: LucideIcon; variant?: "success" | "danger" }
> = {
  actif: { label: "Valider la fiche", icon: CircleCheck, variant: "success" },
  en_attente_verification: { label: "Remettre en vérification", icon: Clock },
  dossier_incomplet: { label: "Dossier incomplet", icon: FileWarning },
  suspendu: { label: "Suspendre", icon: Ban, variant: "danger" },
  inactif: { label: "Désactiver", icon: CircleMinus },
  radie: { label: "Radier", icon: CircleX, variant: "danger" },
};

export const nomChauffeur = (c: Chauffeur) => `${c.prenom} ${c.nom.toUpperCase()}`;

/** Changement de statut de la fiche, avec la justification gardée dans l'historique. */
export function ChangerStatutChauffeurModal({
  chauffeur,
  statut,
  onClose,
  onDone,
}: {
  chauffeur: Chauffeur;
  statut: StatutChauffeur;
  onClose: () => void;
  onDone?: (fiche: Chauffeur) => void;
}) {
  const update = useChauffeursStore((s) => s.update);
  const changement = useAction();
  const nom = nomChauffeur(chauffeur);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const justification = String(new FormData(e.currentTarget).get("justification") ?? "").trim();
    let fiche: Chauffeur | null = null;
    const ok = await changement.run(async () => {
      fiche = await update(chauffeur.id, { statut, justification_statut: justification });
    }, `Fiche de ${nom} : ${STATUTS_CHAUFFEUR[statut].label.toLowerCase()}`);
    if (ok && fiche) {
      onDone?.(fiche);
      onClose();
    }
  }

  return (
    <FormModal
      size="sm"
      open
      title={ACTIONS_STATUT_CHAUFFEUR[statut].label}
      subtitle={`${nom} : ${STATUTS_CHAUFFEUR[chauffeur.statut].label} → ${STATUTS_CHAUFFEUR[statut].label}`}
      onClose={onClose}
      onSubmit={onSubmit}
      submitLabel="Changer le statut"
      pending={changement.pending}
      formKey={`${chauffeur.id}-${statut}`}
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

/**
 * Mise sur liste noire (avec la raison) ou retrait.
 * Sur liste noire, le chauffeur est suspendu ; au retrait, il redevient actif.
 */
export function ListeNoireModal({
  chauffeur,
  onClose,
  onDone,
}: {
  chauffeur: Chauffeur;
  onClose: () => void;
  onDone?: (fiche: Chauffeur) => void;
}) {
  const action = useAction();
  const retrait = chauffeur.est_blackliste;
  const nom = nomChauffeur(chauffeur);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raison = String(new FormData(e.currentTarget).get("raison") ?? "").trim();
    let fiche: Chauffeur | null = null;
    const ok = await action.run(
      async () => {
        fiche = await api<Chauffeur>(
          `/chauffeurs/${chauffeur.id}/blacklist`,
          retrait ? "DELETE" : "POST",
          retrait ? undefined : { raison },
        );
        await useChauffeursStore.getState().fetchAll({ force: true });
      },
      retrait ? `${nom} retiré de la liste noire` : `${nom} mis sur liste noire`,
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
      title={retrait ? "Retirer de la liste noire" : "Mettre sur liste noire"}
      subtitle={nom}
      onClose={onClose}
      onSubmit={onSubmit}
      submitLabel={retrait ? "Retirer" : "Mettre sur liste noire"}
      pending={action.pending}
      formKey={`${chauffeur.id}-liste-noire`}
    >
      {retrait ? (
        <p className="text-sm">
          Le chauffeur redeviendra <strong>actif</strong>.
          {chauffeur.raison_blacklist && (
            <span className="mt-2 block rounded-md border-l-4 border-border bg-background px-3 py-2">
              Raison : {chauffeur.raison_blacklist}
            </span>
          )}
        </p>
      ) : (
        <>
          <p className="text-sm text-text-muted">
            Le chauffeur sera suspendu et ne pourra plus être remis en service.
          </p>
          <Field label="Raison *">
            <textarea name="raison" rows={3} required className="input-field" />
          </Field>
        </>
      )}
    </FormModal>
  );
}
