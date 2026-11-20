"use client";

import { useState } from "react";
import { StatusDot } from "@/components/ui";
import {
  STATUTS_PROFESSIONNELS,
  situationDe,
  type Chauffeur,
  type StatutProfessionnel,
} from "@/types";
import { toast, useChauffeursStore, useMesChauffeursStore } from "@/stores";
import { nomChauffeur } from "./ChauffeurStatutModals";

/**
 * Situation de travail d'un chauffeur : gérée par son propriétaire depuis son espace,
 * ou par la mairie au guichet. Liste déroulante si `modifiable` ; la liste noire prime.
 */
export default function SituationChauffeur({
  chauffeur: c,
  modifiable,
  espace = "proprietaire",
  onChange,
}: {
  chauffeur: Chauffeur;
  modifiable: boolean;
  /** Route utilisée : `/chauffeurs/mes-chauffeurs` (propriétaire) ou `/chauffeurs` (mairie). */
  espace?: "mairie" | "proprietaire";
  /** Fiche renvoyée par l'API après le changement. */
  onChange?: (fiche: Chauffeur) => void;
}) {
  const [enCours, setEnCours] = useState(false);

  async function changer(situation: StatutProfessionnel) {
    setEnCours(true);
    const store = espace === "mairie" ? useChauffeursStore : useMesChauffeursStore;
    try {
      const fiche = await store.getState().update(c.id, { statut_professionnel: situation });
      onChange?.(fiche);
      toast.success(
        `${nomChauffeur(c)} : ${STATUTS_PROFESSIONNELS[situation].label.toLowerCase()}`,
      );
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setEnCours(false);
    }
  }

  if (c.est_blackliste) {
    return (
      <span title="Décision de la mairie">
        <StatusDot tone="danger" label="Liste noire" />
      </span>
    );
  }

  if (!modifiable) {
    const { label, tone } = situationDe(c);
    return <StatusDot tone={tone} label={label} />;
  }

  return (
    <select
      aria-label={`Situation de ${nomChauffeur(c)}`}
      value={c.statut_professionnel}
      disabled={enCours}
      // Le clic ne doit pas ouvrir la fiche quand la liste est dans une ligne cliquable
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => changer(e.target.value as StatutProfessionnel)}
      className="rounded-md border border-border bg-surface px-2 py-1 text-sm font-semibold"
    >
      {(Object.keys(STATUTS_PROFESSIONNELS) as StatutProfessionnel[]).map((s) => (
        <option key={s} value={s}>
          {STATUTS_PROFESSIONNELS[s].label}
        </option>
      ))}
    </select>
  );
}
