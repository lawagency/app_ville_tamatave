"use client";

import { useEffect, useState } from "react";
import { Car, ClipboardCheck, Link2, MapPin, Plus, TriangleAlert, X } from "lucide-react";
import ControleDetails from "@/components/controles/ControleDetails";
import ResultatDot from "@/components/controles/ResultatDot";
import FormModal, { FormSection } from "@/components/FormModal";
import { CellTitle, DataTable, Field, FilterTabs, PageHeader, type Tone } from "@/components/ui";
import { formatDate, readForm } from "@/lib/api";
import { peutVoir } from "@/lib/espaces";
import { useAction } from "@/lib/useAction";
import {
  GRAVITES,
  RESULTATS_CONTROLE,
  TYPES_ANOMALIE,
  TYPES_CONTROLE,
  type Anomalie,
  type Controle,
} from "@/types";
import { useAuthStore, useControlesStore, useUnitesControleStore } from "@/stores";

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

type Onglet = "tous" | Controle["resultat"];

export default function ControlesPage() {
  const controles = useControlesStore();
  const unites = useUnitesControleStore((s) => s.items);
  const voitUnites = useAuthStore((s) => peutVoir(s.user, "unites"));
  const [formOpen, setFormOpen] = useState(false);
  const [anomalies, setAnomalies] = useState<Anomalie[]>([]);
  const enregistrement = useAction();
  const [onglet, setOnglet] = useState<Onglet>("tous");

  useEffect(() => {
    useControlesStore.getState().fetchAll();
  }, []);

  useEffect(() => {
    if (voitUnites) useUnitesControleStore.getState().fetchAll();
  }, [voitUnites]);

  const rows =
    onglet === "tous" ? controles.items : controles.items.filter((c) => c.resultat === onglet);

  const onglets: { key: Onglet; label: string; tone: Tone; count: number }[] = [
    { key: "tous", label: "Tous", tone: "primary", count: controles.items.length },
    ...(Object.keys(RESULTATS_CONTROLE) as Controle["resultat"][]).map((key) => ({
      key,
      label: RESULTATS_CONTROLE[key].label,
      tone: RESULTATS_CONTROLE[key].tone as Tone,
      count: controles.items.filter((c) => c.resultat === key).length,
    })),
  ];

  function updateAnomalie(index: number, patch: Partial<Anomalie>) {
    setAnomalies((list) => list.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  }

  function ouvrir() {
    setAnomalies([]);
    setFormOpen(true);
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
    if (ok) setFormOpen(false);
  }

  return (
    <>
      <PageHeader
        title="Contrôles"
        subtitle="Historique des contrôles effectués"
        action={
          <button onClick={ouvrir} className="btn-primary flex items-center gap-2">
            <Plus className="size-4" />
            Nouveau contrôle
          </button>
        }
      />

      <FormModal
        size="lg"
        open={formOpen}
        title="Nouveau contrôle"
        subtitle="Les champs marqués * sont obligatoires."
        onClose={() => setFormOpen(false)}
        onSubmit={onSubmit}
        submitLabel="Enregistrer le contrôle"
        pending={enregistrement.pending}
      >
        <FormSection title="Contrôle" icon={ClipboardCheck}>
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
            <select name="resultat" required className="input-field" defaultValue="en_verification">
              {Object.entries(RESULTATS_CONTROLE).map(([value, r]) => (
                <option key={value} value={value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Unité de contrôle">
            {voitUnites ? (
              <select name="corps_controle_id" className="input-field" defaultValue="">
                <option value="">Aucune</option>
                {unites.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nom}
                  </option>
                ))}
              </select>
            ) : (
              <input name="corps_controle_id" type="number" min={1} className="input-field" />
            )}
          </Field>
          <Field label="Identifiant agent">
            <input name="agent_identifiant" className="input-field" />
          </Field>
        </FormSection>

        <FormSection title="Concerné" icon={Link2}>
          <Field label="N° véhicule">
            <input name="vehicule_id" type="number" min={1} className="input-field" />
          </Field>
          <Field label="N° chauffeur">
            <input name="chauffeur_id" type="number" min={1} className="input-field" />
          </Field>
          <Field label="N° propriétaire">
            <input name="proprietaire_id" type="number" min={1} className="input-field" />
          </Field>
        </FormSection>

        <FormSection title="Lieu et observations" icon={MapPin}>
          <Field label="Latitude">
            <input name="latitude" type="number" step="any" className="input-field" />
          </Field>
          <Field label="Longitude">
            <input name="longitude" type="number" step="any" className="input-field" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Observations">
              <textarea name="observations" rows={3} className="input-field" />
            </Field>
          </div>
        </FormSection>

        <FormSection title={`Anomalies (${anomalies.length})`} icon={TriangleAlert} columns={1}>
          {anomalies.map((a, i) => (
            <div key={i} className="space-y-3 rounded-md border border-border bg-background p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Anomalie {i + 1}</p>
                <button
                  type="button"
                  onClick={() => setAnomalies((list) => list.filter((_, j) => j !== i))}
                  className="icon-btn hover:text-danger"
                  aria-label="Retirer l'anomalie"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
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
              </div>
              <Field label="Description *">
                <input
                  required
                  value={a.description}
                  onChange={(e) => updateAnomalie(i, { description: e.target.value })}
                  className="input-field"
                />
              </Field>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setAnomalies((list) => [...list, NOUVELLE_ANOMALIE])}
            className="btn-ghost inline-flex w-fit items-center gap-2 text-sm"
          >
            <Plus className="size-4" />
            Ajouter une anomalie
          </button>
        </FormSection>
      </FormModal>

      <DataTable
        loading={controles.loading}
        error={controles.error}
        rows={rows}
        toolbar={<FilterTabs value={onglet} onChange={setOnglet} tabs={onglets} />}
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
