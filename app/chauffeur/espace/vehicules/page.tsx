"use client";

import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import TableVehicules from "@/components/vehicules/TableVehicules";
import { api } from "@/lib/api";
import type { Vehicule } from "@/types";

/** Véhicules que conduit le chauffeur connecté (lecture seule). */
export default function MesVehiculesChauffeurPage() {
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState<string>();

  useEffect(() => {
    api<Vehicule[]>("/vehicules/moi")
      .then(setVehicules)
      .catch((e: Error) => setErreur(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Mes véhicules</h1>
        <p className="mt-1 text-text-muted">Les véhicules qui vous sont confiés.</p>
      </div>

      <TableVehicules loading={loading} error={erreur} rows={vehicules} masquer={["chauffeur"]} />

      <p className="flex items-start gap-2 text-sm text-text-muted">
        <Info className="mt-0.5 size-4 shrink-0" />
        C&apos;est le propriétaire du véhicule ou la mairie qui vous l&apos;attribue.
      </p>
    </div>
  );
}
