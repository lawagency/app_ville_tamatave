"use client";

import { useEffect, useState } from "react";
import LoadingButton from "@/components/LoadingButton";
import { CellTitle, DataTable, DetailPanel, Field, PageHeader } from "@/components/ui";
import { formatDate, readForm } from "@/lib/api";
import { useAction } from "@/lib/useAction";
import { useProprietairesStore, useUiStore } from "@/stores";

export default function ProprietairesPage() {
  const proprietaires = useProprietairesStore();
  const [showForm, setShowForm] = useState(false);
  const enregistrement = useAction();
  const search = useUiStore((s) => s.proprietaireSearch);
  const setSearch = useUiStore((s) => s.setProprietaireSearch);

  useEffect(() => {
    useProprietairesStore.getState().fetchAll();
  }, []);

  const q = search.toLowerCase();
  const rows = proprietaires.items.filter((p) =>
    [p.identifiant, p.nom, p.prenom, p.telephone_principal, p.cin].some((v) =>
      v?.toLowerCase().includes(q),
    ),
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const ok = await enregistrement.run(
      () => proprietaires.create(readForm(form)),
      "Propriétaire enregistré",
    );
    if (ok) {
      form.reset();
      setShowForm(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Propriétaires"
        subtitle="Propriétaires de véhicules enregistrés"
        action={
          <button
            onClick={() => setShowForm((v) => !v)}
            className={showForm ? "btn-ghost" : "btn-primary"}
          >
            {showForm ? "Annuler" : "Nouveau propriétaire"}
          </button>
        }
      />

      {showForm && (
        <form onSubmit={onSubmit} className="card mb-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Identifiant *">
              <input name="identifiant" required className="input-field" />
            </Field>
            <Field label="Nom *">
              <input name="nom" required className="input-field" />
            </Field>
            <Field label="Prénom *">
              <input name="prenom" required className="input-field" />
            </Field>
            <Field label="Date de naissance">
              <input name="date_naissance" type="date" className="input-field" />
            </Field>
            <Field label="Lieu de naissance">
              <input name="lieu_naissance" className="input-field" />
            </Field>
            <Field label="Sexe">
              <select name="sexe" className="input-field" defaultValue="">
                <option value="">—</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </Field>
            <Field label="Téléphone principal *">
              <input name="telephone_principal" required className="input-field" />
            </Field>
            <Field label="Téléphone secondaire">
              <input name="telephone_secondaire" className="input-field" />
            </Field>
            <Field label="Email">
              <input name="email" type="email" className="input-field" />
            </Field>
            <Field label="CIN">
              <input name="cin" className="input-field" />
            </Field>
            <Field label="Profession">
              <input name="profession" className="input-field" />
            </Field>
            <Field label="Adresse">
              <input name="adresse" className="input-field" />
            </Field>
          </div>
          <div className="flex justify-end">
            <LoadingButton type="submit" loading={enregistrement.pending} className="btn-primary">
              Créer
            </LoadingButton>
          </div>
        </form>
      )}

      <div className="mb-4 max-w-sm">
        <input
          type="search"
          placeholder="Rechercher (nom, identifiant, CIN, téléphone)…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
        />
      </div>

      <DataTable
        loading={proprietaires.loading}
        error={proprietaires.error}
        rows={rows}
        columns={[
          {
            label: "Propriétaire",
            render: (p) => (
              <CellTitle title={`${p.prenom} ${p.nom}`} subtitle={<code>{p.identifiant}</code>} />
            ),
          },
          { label: "Téléphone", render: (p) => p.telephone_principal },
          { label: "CIN", render: (p) => p.cin ?? "—" },
          { label: "Adresse", render: (p) => p.adresse ?? "—" },
          { label: "Enregistré le", render: (p) => formatDate(p.created_at) },
        ]}
        renderDetails={(p) => (
          <DetailPanel
            title="Fiche du propriétaire"
            items={[
              { label: "Identifiant", value: <code>{p.identifiant}</code> },
              { label: "Nom complet", value: `${p.prenom} ${p.nom}` },
              {
                label: "Sexe",
                value: p.sexe === "M" ? "Masculin" : p.sexe === "F" ? "Féminin" : undefined,
              },
              { label: "CIN", value: p.cin },
              {
                label: "Naissance",
                value: p.date_naissance
                  ? `${formatDate(p.date_naissance)}${p.lieu_naissance ? ` à ${p.lieu_naissance}` : ""}`
                  : p.lieu_naissance,
              },
              { label: "Profession", value: p.profession },
              { label: "Téléphone principal", value: p.telephone_principal },
              { label: "Téléphone secondaire", value: p.telephone_secondaire },
              { label: "Email", value: p.email },
              { label: "Adresse", value: p.adresse },
              { label: "Enregistré le", value: formatDate(p.created_at) },
            ]}
          />
        )}
      />
    </>
  );
}
