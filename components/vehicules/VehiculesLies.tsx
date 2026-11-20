"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Vehicule } from "@/types";
import TableVehicules from "./TableVehicules";

/** Charge les véhicules d'un propriétaire ou d'un chauffeur (`GET /vehicules?…`). */
export function useVehiculesLies(
  filtre: "proprietaire_id" | "chauffeur_id",
  id: string,
  actif: boolean,
) {
  const [vehicules, setVehicules] = useState<Vehicule[] | null>(null);
  const [erreur, setErreur] = useState<string>();

  useEffect(() => {
    if (!actif) return;
    api<Vehicule[]>(`/vehicules?${filtre}=${id}`)
      .then(setVehicules)
      .catch((e: Error) => setErreur(e.message));
  }, [filtre, id, actif]);

  return { vehicules, erreur };
}

/** Onglet « Véhicules » d'une fiche (propriétaire ou chauffeur), côté mairie. */
export default function VehiculesLies({
  vehicules,
  erreur,
  masquer,
}: {
  vehicules: Vehicule[] | null;
  erreur?: string;
  masquer: "proprietaire" | "chauffeur";
}) {
  return (
    <TableVehicules
      loading={vehicules === null && !erreur}
      error={erreur}
      rows={vehicules ?? []}
      lien={(v) => `/admin/vehicules/${v.id}`}
      lienProprietaire={(id) => `/admin/proprietaires/${id}`}
      lienChauffeur={(id) => `/admin/chauffeurs/${id}`}
      masquer={[masquer, "autorisation"]}
    />
  );
}
