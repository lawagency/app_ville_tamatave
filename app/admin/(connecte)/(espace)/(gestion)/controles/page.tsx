"use client";

import { useEffect, useState } from "react";
import { Car } from "lucide-react";
import ControleDetails from "@/components/controles/ControleDetails";
import ResultatDot from "@/components/controles/ResultatDot";
import LoadingButton from "@/components/LoadingButton";
import { CellTitle, DataTable, Field, PageHeader } from "@/components/ui";
import { formatDate, readForm } from "@/lib/api";
import { useAction } from "@/lib/useAction";
import {
  GRAVITES,
  RESULTATS_CONTROLE,
  TYPES_ANOMALIE,
  TYPES_CONTROLE,
  type Anomalie,
} from "@/types";
import { useControlesStore } from "@/stores";

const NOUVELLE_ANOMALIE: Anomalie = {
  type_anomalie: "document_manquant",
  gravite: "normale",
  description: "",
};

const NUMBER_FIELDS = [
  "vehicule_id",
  "chauffeur_id",
  "proprietaire_id",
  "corps_controle_id",
  "latitude",
  "longitude",
];

export default function ControlesPage() {
  const controles = useControlesStore();
  const [showForm, setShowForm] = useState(false);
  const [anomalies, setAnomalies] = useState<Anomalie[]>([]);
  const enregistrement = useAction();
  const [filtre, setFiltre] = useState("");

  useEffect(() => {
    useControlesStore.getState().fetchAll();
  }, []);

  const rows = filtre ? controles.items.filter((c) => c.resultat === filtre) : controles.items;

  function updateAnomalie(index: number, patch: Partial<Anomalie>) {
    setAnomalies((list) => list.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const ok = await enregistrement.run(
      () =>
        controles.create({
          ...readForm(form, NUMBER_FIELDS),
          ...(anomalies.length ? { anomalies } : {}),
        }),
      "Contrôle enregistré",
    );
    if (ok) {
      form.reset();
      setAnomalies([]);
      setShowForm(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Contrôles"
        subtitle="Historique des contrôles effectués"
        action={
          <button
            onClick={() => setShowForm((v) => !v)}
            className={showForm ? "btn-ghost" : "btn-primary"}
          >
            {showForm ? "Annuler" : "Nouveau contrôle"}
          </button>
        }
      />

      {showForm && (
        <form onSubmit={onSubmit} className="card mb-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Type de contrôle *">
              <select name="type_controle" required className="input-field" defaultValue="terrain">
                {Object.entries(TYPES_CONTROLE).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Résultat *">
              <select
                name="resultat"
                required
                className="input-field"
                defaultValue="en_verification"
              >
                {Object.entries(RESULTATS_CONTROLE).map(([value, r]) => (
                  <option key={value} value={value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Identifiant agent">
              <input name="agent_identifiant" className="input-field" />
            </Field>
            <Field label="ID véhicule">
              <input name="vehicule_id" type="number" min={1} className="input-field" />
            </Field>
            <Field label="ID chauffeur">
              <input name="chauffeur_id" type="number" min={1} className="input-field" />
            </Field>
            <Field label="ID propriétaire">
              <input name="proprietaire_id" type="number" min={1} className="input-field" />
            </Field>
            <Field label="ID corps de contrôle">
              <input name="corps_controle_id" type="number" min={1} className="input-field" />
            </Field>
            <Field label="Latitude">
              <input name="latitude" type="number" step="any" className="input-field" />
            </Field>
            <Field label="Longitude">
              <input name="longitude" type="number" step="any" className="input-field" />
            </Field>
          </div>
          <Field label="Observations">
            <textarea name="observations" rows={3} className="input-field" />
          </Field>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Anomalies ({anomalies.length})</h3>
              <button
                type="button"
                onClick={() => setAnomalies((list) => [...list, NOUVELLE_ANOMALIE])}
                className="btn-ghost"
              >
                Ajouter une anomalie
              </button>
            </div>
            {anomalies.map((a, i) => (
              <div
                key={i}
                className="grid gap-3 md:grid-cols-[1fr_1fr_2fr_auto] items-end border border-border rounded-md p-3"
              >
                <Field label="Type">
                  <select
                    value={a.type_anomalie}
                    onChange={(e) =>
                      updateAnomalie(i, {
                        type_anomalie: e.target.value as Anomalie["type_anomalie"],
                      })
                    }
                    className="input-field"
                  >
                    {Object.entries(TYPES_ANOMALIE).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Gravité">
                  <select
                    value={a.gravite}
                    onChange={(e) =>
                      updateAnomalie(i, { gravite: e.target.value as Anomalie["gravite"] })
                    }
                    className="input-field"
                  >
                    {Object.entries(GRAVITES).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Description *">
                  <input
                    required
                    value={a.description}
                    onChange={(e) => updateAnomalie(i, { description: e.target.value })}
                    className="input-field"
                  />
                </Field>
                <button
                  type="button"
                  onClick={() => setAnomalies((list) => list.filter((_, j) => j !== i))}
                  className="btn-danger"
                >
                  Retirer
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <LoadingButton type="submit" loading={enregistrement.pending} className="btn-primary">
              Enregistrer le contrôle
            </LoadingButton>
          </div>
        </form>
      )}

      <div className="mb-4 max-w-xs">
        <select value={filtre} onChange={(e) => setFiltre(e.target.value)} className="input-field">
          <option value="">Tous les résultats</option>
          {Object.entries(RESULTATS_CONTROLE).map(([value, r]) => (
            <option key={value} value={value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        loading={controles.loading}
        error={controles.error}
        rows={rows}
        columns={[
          {
            label: "Véhicule",
            render: (c) => (
              <CellTitle
                title={c.immatriculation ?? `Contrôle n°${c.id}`}
                subtitle={formatDate(c.date_controle)}
                icon={<Car className="size-5" />}
              />
            ),
          },
          { label: "Type", render: (c) => TYPES_CONTROLE[c.type_controle] ?? c.type_controle },
          { label: "Chauffeur", render: (c) => c.chauffeur_nom ?? "—" },
          { label: "Agent", render: (c) => c.agent_identifiant ?? "—" },
          { label: "Résultat", render: (c) => <ResultatDot resultat={c.resultat} /> },
          {
            label: "Observations",
            render: (c) => (
              <span className="block max-w-xs truncate" title={c.observations ?? undefined}>
                {c.observations ?? "—"}
              </span>
            ),
          },
        ]}
        renderDetails={(c) => <ControleDetails controle={c} />}
      />
    </>
  );
}
