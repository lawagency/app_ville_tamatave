"use client";

import { useEffect, useState } from "react";
import { Car, Hash, Pencil, UserRound, Users, type LucideIcon } from "lucide-react";
import FormModal, { FormSection } from "@/components/FormModal";
import Skeleton from "@/components/Skeleton";
import { ActifDot, Field } from "@/components/ui";
import { formaterIdentifiant, JETONS } from "@/lib/identifiants";
import { useAction } from "@/lib/useAction";
import { CIBLES_IDENTIFIANT, type CibleIdentifiant, type ParametreIdentifiant } from "@/types";
import { useParametresIdentifiantsStore } from "@/stores";

const ICONES: Record<CibleIdentifiant, LucideIcon> = {
  proprietaire: UserRound,
  chauffeur: Users,
  vehicule: Car,
};

const SEPARATEURS = [
  { valeur: "-", label: "Tiret  ( - )" },
  { valeur: "/", label: "Barre  ( / )" },
  { valeur: ".", label: "Point  ( . )" },
  { valeur: "_", label: "Souligné  ( _ )" },
  { valeur: "", label: "Aucun" },
];

type Format = Omit<ParametreIdentifiant, "id" | "commune_id" | "cible">;

const parDefaut = (cible: CibleIdentifiant): Format => ({
  prefixe: CIBLES_IDENTIFIANT[cible].prefixe,
  suffixe: null,
  longueur_sequence: 4,
  separateur: "-",
  format_personnalise: null,
  actif: true,
});

/** Format de numérotation des propriétaires, chauffeurs et véhicules. */
export default function IdentifiantsConfig() {
  const parametres = useParametresIdentifiantsStore();
  const [cible, setCible] = useState<CibleIdentifiant | null>(null);
  const [format, setFormat] = useState<Format>(parDefaut("proprietaire"));
  // Rendu seulement une fois connecté : la date du jour sert à l'aperçu ({ANNEE}, {MOIS})
  const [date] = useState(() => new Date());
  const enregistrement = useAction();

  useEffect(() => {
    useParametresIdentifiantsStore.getState().fetchAll();
  }, []);

  const parametreDe = (c: CibleIdentifiant) => parametres.items.find((p) => p.cible === c);
  const formatDe = (c: CibleIdentifiant): Format => parametreDe(c) ?? parDefaut(c);
  const apercu = (f: Format) => formaterIdentifiant(f, 1, date);

  function ouvrir(c: CibleIdentifiant) {
    setCible(c);
    setFormat(formatDe(c));
  }

  const modifier = <K extends keyof Format>(champ: K, valeur: Format[K]) =>
    setFormat((f) => ({ ...f, [champ]: valeur }));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!cible) return;
    const existant = parametreDe(cible);
    const body = {
      prefixe: format.prefixe ?? "",
      suffixe: format.suffixe ?? "",
      longueur_sequence: Number(format.longueur_sequence),
      separateur: format.separateur ?? "",
      format_personnalise: format.format_personnalise ?? "",
      actif: format.actif,
    };
    const ok = await enregistrement.run(
      () =>
        existant ? parametres.update(existant.id, body) : parametres.create({ ...body, cible }),
      `Format des identifiants « ${CIBLES_IDENTIFIANT[cible].label} » enregistré`,
    );
    if (ok) setCible(null);
  }

  return (
    <div className="card mt-6 p-0">
      <div className="flex items-center gap-2 border-b border-border px-6 py-5 lg:px-8">
        <Hash className="size-4 text-primary" />
        <div>
          <h2 className="card-title">Format des identifiants</h2>
          <p className="mt-0.5 text-sm text-text-muted">
            Numérotation attribuée automatiquement à chaque nouvelle fiche.
          </p>
        </div>
      </div>

      {parametres.error ? (
        <p className="alert-error m-6">{parametres.error}</p>
      ) : (
        <ul className="divide-y divide-border">
          {(Object.keys(CIBLES_IDENTIFIANT) as CibleIdentifiant[]).map((c) => {
            const Icon = ICONES[c];
            const configure = parametreDe(c);
            return (
              <li key={c} className="flex flex-wrap items-center gap-4 px-6 py-4 lg:px-8">
                <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-40 flex-1">
                  <p className="font-semibold">{CIBLES_IDENTIFIANT[c].label}</p>
                  <p className="text-xs text-text-muted">
                    {configure ? "Format personnalisé" : "Format par défaut"}
                  </p>
                </div>
                {parametres.loading && parametres.items.length === 0 ? (
                  <Skeleton className="h-8 w-40" />
                ) : (
                  <code className="rounded-md bg-background px-3 py-1.5 font-mono text-sm font-semibold tracking-wider text-primary">
                    {apercu(formatDe(c))}
                  </code>
                )}
                <span className="w-20">
                  <ActifDot actif={formatDe(c).actif} />
                </span>
                <button
                  type="button"
                  onClick={() => ouvrir(c)}
                  className="btn-ghost inline-flex items-center gap-2 text-sm"
                >
                  <Pencil className="size-4" />
                  Modifier
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <FormModal
        open={cible !== null}
        title="Format des identifiants"
        subtitle={cible ? CIBLES_IDENTIFIANT[cible].label : undefined}
        onClose={() => setCible(null)}
        onSubmit={onSubmit}
        submitLabel="Enregistrer"
        pending={enregistrement.pending}
        formKey={cible ?? undefined}
      >
        <div className="flex flex-col items-center gap-1 rounded-md bg-primary/5 py-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Aperçu
          </span>
          <code className="font-mono text-2xl font-bold tracking-wider text-primary">
            {apercu(format) || "—"}
          </code>
        </div>

        <FormSection title="Composition" icon={Hash}>
          <Field label="Préfixe">
            <input
              value={format.prefixe ?? ""}
              onChange={(e) => modifier("prefixe", e.target.value.toUpperCase())}
              maxLength={10}
              className="input-field font-mono"
            />
          </Field>
          <Field label="Suffixe">
            <input
              value={format.suffixe ?? ""}
              onChange={(e) => modifier("suffixe", e.target.value.toUpperCase())}
              maxLength={10}
              placeholder="Facultatif"
              className="input-field font-mono"
            />
          </Field>
          <Field label="Séparateur">
            <select
              value={format.separateur ?? ""}
              onChange={(e) => modifier("separateur", e.target.value)}
              className="input-field"
            >
              {SEPARATEURS.map((s) => (
                <option key={s.label} value={s.valeur}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nombre de chiffres">
            <input
              type="number"
              min={1}
              max={10}
              required
              value={format.longueur_sequence}
              onChange={(e) => modifier("longueur_sequence", Number(e.target.value))}
              className="input-field"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Format personnalisé (facultatif)">
              <input
                value={format.format_personnalise ?? ""}
                onChange={(e) => modifier("format_personnalise", e.target.value || null)}
                maxLength={60}
                placeholder="{PREFIXE}{SEP}{ANNEE}{SEP}{SEQ}"
                className="input-field font-mono"
              />
            </Field>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {JETONS.map((j) => (
                <button
                  key={j}
                  type="button"
                  onClick={() =>
                    modifier("format_personnalise", (format.format_personnalise ?? "") + j)
                  }
                  className="rounded-sm border border-border px-2 py-0.5 font-mono text-xs text-text-muted hover:border-primary hover:text-primary"
                >
                  {j}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-text-muted">
              Laissez vide pour utiliser préfixe + numéro + suffixe. Cliquez sur un jeton pour
              l&apos;ajouter.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={format.actif}
              onChange={(e) => modifier("actif", e.target.checked)}
              className="size-4 accent-primary"
            />
            Format actif (sinon le format par défaut est utilisé)
          </label>
        </FormSection>
      </FormModal>
    </div>
  );
}
