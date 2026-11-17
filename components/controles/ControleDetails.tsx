"use client";

import { useEffect, useState } from "react";
import Skeleton from "@/components/Skeleton";
import { DetailPanel, StatusDot, type Tone } from "@/components/ui";
import { api, formatDate } from "@/lib/api";
import { GRAVITES, TYPES_ANOMALIE, TYPES_CONTROLE, type Anomalie, type Controle } from "@/types";
import ResultatDot from "./ResultatDot";

const TONS_GRAVITE: Record<Anomalie["gravite"], Tone> = {
  basse: "muted",
  normale: "primary",
  haute: "warning",
  critique: "danger",
};

/** Les anomalies ne sont pas dans la liste : on les charge à l'ouverture des détails. */
export default function ControleDetails({ controle }: { controle: Controle }) {
  const [anomalies, setAnomalies] = useState<Anomalie[]>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let actif = true;
    api<Controle & { anomalies: Anomalie[] }>(`/controles/${controle.id}`)
      .then((c) => actif && setAnomalies(c.anomalies))
      .catch((e: Error) => actif && setError(e.message));
    return () => {
      actif = false;
    };
  }, [controle.id]);

  return (
    <DetailPanel
      title={`Contrôle n°${controle.id}`}
      items={[
        { label: "Date", value: formatDate(controle.date_controle) },
        { label: "Type", value: TYPES_CONTROLE[controle.type_controle] },
        { label: "Résultat", value: <ResultatDot resultat={controle.resultat} /> },
        { label: "Agent", value: controle.agent_identifiant },
        { label: "Véhicule", value: controle.immatriculation },
        { label: "Chauffeur", value: controle.chauffeur_nom },
        { label: "Propriétaire (ID)", value: controle.proprietaire_id },
        { label: "Observations", value: controle.observations },
      ]}
    >
      <div>
        <p className="card-title mb-3">Anomalies</p>
        {error && <p className="alert-error">{error}</p>}
        {!error && !anomalies && (
          <div className="space-y-2">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        )}
        {anomalies?.length === 0 && <p className="text-sm text-text-muted">Aucune anomalie</p>}
        {anomalies && anomalies.length > 0 && (
          <ul className="space-y-2">
            {anomalies.map((a, i) => (
              <li
                key={i}
                className="flex flex-wrap items-center gap-4 rounded-md border border-border bg-surface px-4 py-3 text-sm"
              >
                <span className="font-semibold">{TYPES_ANOMALIE[a.type_anomalie]}</span>
                <StatusDot tone={TONS_GRAVITE[a.gravite]} label={GRAVITES[a.gravite]} />
                <span className="text-text-muted">{a.description}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DetailPanel>
  );
}
