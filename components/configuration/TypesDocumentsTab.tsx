"use client";

import { useState } from "react";
import { FileText, Layers, ListPlus, Pencil, Plus, Power, Trash2 } from "lucide-react";
import FormModal from "@/components/FormModal";
import { ConfirmDialog } from "@/components/Modal";
import { ActifDot, CellTitle, DataTable, Field, RowActions } from "@/components/ui";
import { useAction } from "@/lib/useAction";
import {
  CIBLES_DOCUMENT,
  UNITES_DUREE,
  type CibleDocument,
  type SousTypeDocument,
  type TypeDocument,
  type UniteDuree,
} from "@/types";
import { toast, useSousTypesDocumentsStore, useTypesDocumentsStore } from "@/stores";
import SousTypeFormModal from "./SousTypeFormModal";

/** Ligne de sous-type dans le formulaire du type ; `id` absent : sous-type à créer. */
type LigneSousType = { cle: number; id?: number; nom: string };

let prochaineCle = 0;
const nouvelleLigne = (nom = "", id?: number): LigneSousType => ({
  cle: prochaineCle++,
  id,
  nom,
});

/** « 1 an », « 6 mois »… ou « Sans expiration ». */
export function dureeValidite(t: Pick<TypeDocument, "duree_valeur" | "duree_unite">) {
  if (!t.duree_valeur || !t.duree_unite) return "Sans expiration";
  const unite = UNITES_DUREE[t.duree_unite];
  return `${t.duree_valeur} ${t.duree_valeur > 1 ? unite.plusieurs : unite.un}`;
}

type Props = {
  sousTypes: SousTypeDocument[];
  onglets: React.ReactNode;
};

export default function TypesDocumentsTab({ sousTypes, onglets }: Props) {
  const types = useTypesDocumentsStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TypeDocument | null>(null);
  const [deleting, setDeleting] = useState<TypeDocument | null>(null);
  // Formulaire de sous-type ouvert depuis la ligne d'un type
  const [sousTypeForm, setSousTypeForm] = useState<{
    typeId: number;
    sousType: SousTypeDocument | null;
  } | null>(null);
  const [expire, setExpire] = useState(true);
  const [avecSousTypes, setAvecSousTypes] = useState(false);
  const [lignes, setLignes] = useState<LigneSousType[]>([]);
  const enregistrement = useAction();
  const action = useAction();
  const sousTypesStore = useSousTypesDocumentsStore();

  const sousTypesDe = (t: TypeDocument) =>
    sousTypes.filter((s) => String(s.type_document_id) === String(t.id));
  const nbSousTypes = (t: TypeDocument) => sousTypesDe(t).length;

  function ouvrir(type: TypeDocument | null) {
    setEditing(type);
    setExpire(type ? Boolean(type.duree_valeur) : true);
    const existants = type ? sousTypesDe(type) : [];
    setAvecSousTypes(existants.length > 0);
    setLignes(
      existants.length > 0
        ? existants.map((st) => nouvelleLigne(st.nom, st.id))
        : [nouvelleLigne()],
    );
    setFormOpen(true);
  }

  const modifierLigne = (cle: number, nom: string) =>
    setLignes((ls) => ls.map((l) => (l.cle === cle ? { ...l, nom } : l)));
  const retirerLigne = (cle: number) => setLignes((ls) => ls.filter((l) => l.cle !== cle));

  /** Crée, renomme et supprime les sous-types pour qu'ils correspondent au formulaire. */
  async function enregistrerSousTypes(typeId: number) {
    const voulues = avecSousTypes ? lignes.filter((l) => l.nom.trim()) : [];
    const existants = sousTypes.filter((st) => String(st.type_document_id) === String(typeId));
    for (const st of existants) {
      const ligne = voulues.find((l) => l.id === st.id);
      if (!ligne) await sousTypesStore.remove(st.id);
      else if (ligne.nom.trim() !== st.nom) {
        await sousTypesStore.update(st.id, { nom: ligne.nom.trim() });
      }
    }
    for (const l of voulues.filter((l) => !l.id)) {
      await sousTypesStore.create({ type_document_id: typeId, nom: l.nom.trim(), actif: true });
    }
  }

  function fermer() {
    setFormOpen(false);
    setDeleting(null);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const saisie = new FormData(e.currentTarget);
    const cibles = saisie.getAll("cibles").map(String) as CibleDocument[];
    if (cibles.length === 0) {
      toast.error("Choisissez au moins une fiche concernée par ce document");
      return;
    }
    const noms = lignes.map((l) => l.nom.trim().toLowerCase()).filter(Boolean);
    if (avecSousTypes && new Set(noms).size !== noms.length) {
      toast.error("Deux sous-types portent le même nom");
      return;
    }
    // Case décochée : le document n'expire pas (CIN…), la durée est effacée
    const body = {
      nom: String(saisie.get("nom") ?? "").trim(),
      cibles,
      actif: saisie.get("actif") === "on",
      duree_valeur: expire ? Number(saisie.get("duree_valeur")) : null,
      duree_unite: expire ? (String(saisie.get("duree_unite")) as UniteDuree) : null,
    };
    const nbNouveaux = avecSousTypes ? lignes.filter((l) => !l.id && l.nom.trim()).length : 0;
    const avec = nbNouveaux ? ` avec ${nbNouveaux} sous-type${nbNouveaux > 1 ? "s" : ""}` : "";
    const ok = await enregistrement.run(
      async () => {
        const type = editing ? await types.update(editing.id, body) : await types.create(body);
        await enregistrerSousTypes(type.id);
      },
      editing ? `Type « ${body.nom} » modifié` : `Type « ${body.nom} » créé${avec}`,
    );
    if (ok) fermer();
  }

  function basculer(t: TypeDocument) {
    return action.run(
      () => types.update(t.id, { actif: !t.actif }),
      `« ${t.nom} » ${t.actif ? "désactivé" : "activé"}`,
    );
  }

  async function onDelete() {
    if (!deleting) return;
    const ok = await action.run(
      () => types.remove(deleting.id),
      `Type « ${deleting.nom} » supprimé`,
    );
    if (ok) fermer();
  }

  return (
    <>
      <DataTable
        loading={types.loading}
        error={types.error}
        rows={types.items}
        toolbar={
          <div className="flex flex-wrap items-center justify-between gap-4">
            {onglets}
            <button onClick={() => ouvrir(null)} className="btn-primary flex items-center gap-2">
              <Plus className="size-4" />
              Nouveau type de document
            </button>
          </div>
        }
        columns={[
          {
            label: "Nom",
            render: (t) => <CellTitle title={t.nom} icon={<FileText className="size-5" />} />,
          },
          {
            label: "Concerne",
            render: (t) => (
              <span className="flex flex-wrap gap-1.5">
                {t.cibles.map((c) => (
                  <span
                    key={c}
                    className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
                  >
                    {CIBLES_DOCUMENT[c] ?? c}
                  </span>
                ))}
              </span>
            ),
          },
          {
            label: "Validité",
            render: (t) => (
              <span className={t.duree_valeur ? "" : "text-text-muted"}>{dureeValidite(t)}</span>
            ),
          },
          {
            label: "Sous-types",
            render: (t) => {
              const liste = sousTypesDe(t);
              if (liste.length === 0) return <span className="text-text-muted">—</span>;
              // Les 3 premiers noms, puis « +n » : le détail complet est sous la ligne
              return (
                <span className="flex flex-wrap items-center gap-1.5">
                  {liste.slice(0, 3).map((s) => (
                    <span
                      key={s.id}
                      className="rounded-md border border-border px-2 py-0.5 text-xs font-semibold"
                    >
                      {s.nom}
                    </span>
                  ))}
                  {liste.length > 3 && (
                    <span className="text-xs text-text-muted">+{liste.length - 3}</span>
                  )}
                </span>
              );
            },
          },
          { label: "Statut", render: (t) => <ActifDot actif={t.actif} /> },
          {
            label: "Actions",
            align: "right",
            render: (t) => (
              <RowActions
                actions={[
                  { label: "Modifier", icon: Pencil, onClick: () => ouvrir(t) },
                  {
                    label: "Ajouter un sous-type",
                    icon: ListPlus,
                    onClick: () => setSousTypeForm({ typeId: t.id, sousType: null }),
                  },
                  {
                    label: t.actif ? "Désactiver" : "Activer",
                    icon: Power,
                    variant: t.actif ? undefined : "success",
                    onClick: () => basculer(t),
                  },
                  {
                    label: "Supprimer",
                    icon: Trash2,
                    variant: "danger",
                    onClick: () => setDeleting(t),
                  },
                ]}
              />
            ),
          },
        ]}
        renderDetails={(t) => (
          <div className="space-y-3 whitespace-normal">
            <div className="flex items-center justify-between gap-4">
              <p className="card-title">Sous-types de « {t.nom} »</p>
              <button
                onClick={() => setSousTypeForm({ typeId: t.id, sousType: null })}
                className="btn-ghost inline-flex items-center gap-2 py-1.5 text-sm"
              >
                <Plus className="size-4" />
                Ajouter un sous-type
              </button>
            </div>
            {sousTypesDe(t).length === 0 ? (
              <p className="text-sm text-text-muted">
                Aucun sous-type. Utile pour préciser le document : catégories de permis (A, B, C…),
                formules d&apos;assurance…
              </p>
            ) : (
              <ul className="divide-y divide-border overflow-hidden rounded-md border border-border bg-surface">
                {sousTypesDe(t).map((s) => (
                  <li key={s.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                    <Layers className="size-4 shrink-0 text-text-muted" />
                    <span className="font-semibold">{s.nom}</span>
                    <span className="min-w-0 flex-1 truncate text-text-muted">{s.description}</span>
                    <ActifDot actif={s.actif} />
                    <button
                      onClick={() => setSousTypeForm({ typeId: t.id, sousType: s })}
                      aria-label={`Modifier ${s.nom}`}
                      title="Modifier"
                      className="icon-btn"
                    >
                      <Pencil className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      />

      {sousTypeForm && (
        <SousTypeFormModal
          types={types.items}
          sousType={sousTypeForm.sousType}
          typeId={sousTypeForm.typeId}
          onClose={() => setSousTypeForm(null)}
        />
      )}

      <FormModal
        size="md"
        open={formOpen}
        title={editing ? "Modifier le type de document" : "Nouveau type de document"}
        subtitle={editing?.nom ?? "Carte grise, assurance, permis de conduire…"}
        onClose={fermer}
        onSubmit={onSubmit}
        submitLabel={editing ? "Enregistrer" : "Créer"}
        pending={enregistrement.pending}
        formKey={editing?.id ?? "nouveau"}
      >
        {/* Grille 2 × 2 : chaque ligne a ses deux champs à la même hauteur */}
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <Field label="Nom *">
            <input
              name="nom"
              required
              defaultValue={editing?.nom}
              placeholder="Assurance"
              className="input-field"
            />
          </Field>

          <div>
            <span className="label-field">Validité</span>
            <div className="flex h-11 items-center gap-2">
              <label className="flex shrink-0 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={expire}
                  onChange={(e) => setExpire(e.target.checked)}
                  className="size-4 accent-primary"
                />
                Expire après
              </label>
              {expire ? (
                <>
                  <input
                    name="duree_valeur"
                    type="number"
                    min={1}
                    required
                    defaultValue={editing?.duree_valeur ?? 1}
                    aria-label="Durée"
                    className="input-field w-16 px-2 text-center"
                  />
                  <select
                    name="duree_unite"
                    defaultValue={editing?.duree_unite ?? "annee"}
                    aria-label="Unité"
                    className="input-field min-w-0 flex-1"
                  >
                    {(Object.keys(UNITES_DUREE) as UniteDuree[]).map((u) => (
                      <option key={u} value={u}>
                        {UNITES_DUREE[u].plusieurs}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <span className="text-sm text-text-muted">— sans expiration</span>
              )}
            </div>
          </div>

          <div>
            <span className="label-field">Concerne *</span>
            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
              {(Object.keys(CIBLES_DOCUMENT) as CibleDocument[]).map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="cibles"
                    value={c}
                    defaultChecked={editing?.cibles.includes(c)}
                    className="size-4 accent-primary"
                  />
                  {CIBLES_DOCUMENT[c]}
                </label>
              ))}
            </div>
          </div>

          <div>
            <span className="label-field">Statut</span>
            <label className="flex items-center gap-2 pt-1 text-sm">
              <input
                type="checkbox"
                name="actif"
                defaultChecked={editing?.actif ?? true}
                className="size-4 accent-primary"
              />
              Actif
            </label>
          </div>
        </div>

        <div className="rounded-md border border-border bg-background p-4">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={avecSousTypes}
              onChange={(e) => {
                setAvecSousTypes(e.target.checked);
                // Toujours au moins une ligne à remplir quand on coche
                if (e.target.checked && lignes.length === 0) setLignes([nouvelleLigne()]);
              }}
              className="size-4 accent-primary"
            />
            <Layers className="size-4 text-primary" />
            Sous-types
            <span className="font-normal text-text-muted">(permis A, B, C…)</span>
          </label>
          {avecSousTypes && (
            <div className="mt-3 space-y-2">
              {/* Liste longue : elle défile seule, la modale garde sa hauteur */}
              <div className="grid max-h-56 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {lignes.map((l, i) => (
                  <div key={l.cle} className="flex items-center gap-1">
                    <input
                      value={l.nom}
                      onChange={(e) => modifierLigne(l.cle, e.target.value)}
                      // Entrée : ajoute une ligne au lieu d'envoyer le formulaire
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          setLignes((ls) => [...ls, nouvelleLigne()]);
                        }
                      }}
                      autoFocus={i > 0 && i === lignes.length - 1 && !l.nom}
                      placeholder={`Sous-type ${i + 1}`}
                      aria-label={`Sous-type ${i + 1}`}
                      className="input-field bg-surface"
                    />
                    <button
                      type="button"
                      onClick={() => retirerLigne(l.cle)}
                      aria-label={`Retirer le sous-type ${i + 1}`}
                      title="Retirer"
                      className="icon-btn hover:text-danger"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setLignes((ls) => [...ls, nouvelleLigne()])}
                title="Astuce : Entrée ajoute aussi une ligne"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                <Plus className="size-4" />
                Ajouter
              </button>
            </div>
          )}
        </div>
      </FormModal>

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer le type de document"
        message={
          <>
            Supprimer <strong>{deleting?.nom}</strong> ?
            {deleting && nbSousTypes(deleting) > 0 && (
              <>
                {" "}
                Ses {nbSousTypes(deleting)} sous-type{nbSousTypes(deleting) > 1 ? "s" : ""} seront
                aussi supprimés.
              </>
            )}
          </>
        }
        onConfirm={onDelete}
        onClose={fermer}
      />
    </>
  );
}
