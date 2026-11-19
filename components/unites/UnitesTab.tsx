"use client";

import { useEffect, useState } from "react";
import { KeyRound, Pencil, Plus, RefreshCw, Siren, Trash2 } from "lucide-react";
import DatePicker from "@/components/DatePicker";
import FormModal, { FormSection } from "@/components/FormModal";
import { ConfirmDialog } from "@/components/Modal";
import {
  ActifDot,
  CellTitle,
  DataTable,
  DetailPanel,
  Field,
  RowActions,
  StatusDot,
} from "@/components/ui";
import { formatDate } from "@/lib/api";
import { useAction } from "@/lib/useAction";
import type { CategorieService, UniteControle } from "@/types";
import { useCommunesStore, useUnitesControleStore } from "@/stores";

/** Code d'accès au portail : 8 caractères sans ambiguïté (pas de 0/O, 1/I). */
function genererCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const octets = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(octets, (o) => alphabet[o % alphabet.length]).join("");
}

const expire = (u: UniteControle) =>
  !!u.date_expiration && new Date(u.date_expiration).getTime() < Date.now();

function Expiration({ unite }: { unite: UniteControle }) {
  if (!unite.date_expiration) return <span className="text-text-muted">Sans limite</span>;
  return expire(unite) ? (
    <StatusDot tone="danger" label={`Expiré le ${formatDate(unite.date_expiration)}`} />
  ) : (
    <StatusDot tone="success" label={formatDate(unite.date_expiration)} />
  );
}

type UnitesTabProps = {
  categories: CategorieService[];
  /** Onglets de la page, placés à gauche de la barre du tableau. */
  onglets: React.ReactNode;
};

export default function UnitesTab({ categories, onglets }: UnitesTabProps) {
  const unites = useUnitesControleStore();
  const communes = useCommunesStore((s) => s.items);

  useEffect(() => {
    useCommunesStore.getState().fetchAll();
  }, []);

  const communeDe = (u: UniteControle) =>
    u.commune_id
      ? (communes.find((c) => String(c.id) === String(u.commune_id))?.nom ??
        `Commune n°${u.commune_id}`)
      : null;
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UniteControle | null>(null);
  const [deleting, setDeleting] = useState<UniteControle | null>(null);
  const [code, setCode] = useState("");
  const enregistrement = useAction();
  const suppression = useAction();

  const categorieDe = (u: UniteControle) =>
    u.type_nom ?? categories.find((c) => String(c.id) === String(u.type_corps_id))?.nom ?? "—";

  function ouvrir(unite: UniteControle | null) {
    setEditing(unite);
    setCode(unite?.code_acces ?? genererCode());
    setFormOpen(true);
  }

  function fermer() {
    setFormOpen(false);
    setDeleting(null);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const saisie = new FormData(e.currentTarget);
    const texte = (champ: string) => String(saisie.get(champ) ?? "").trim();
    const body = {
      nom: texte("nom"),
      type_corps_id: Number(texte("type_corps_id")),
      code_acces: code.trim(),
      notes: texte("notes"),
      actif: saisie.get("actif") === "on",
      // Une seule commune configurée : l'unité lui est rattachée
      ...(!editing?.commune_id && communes[0] ? { commune_id: Number(communes[0].id) } : {}),
      ...(texte("date_expiration") ? { date_expiration: texte("date_expiration") } : {}),
    };
    const ok = await enregistrement.run(
      () => (editing ? unites.update(editing.id, body) : unites.create(body)),
      editing ? `Unité « ${body.nom} » modifiée` : `Unité « ${body.nom} » créée`,
    );
    if (ok) fermer();
  }

  async function onDelete() {
    if (!deleting) return;
    const ok = await suppression.run(
      () => unites.remove(deleting.id),
      `Unité « ${deleting.nom} » supprimée`,
    );
    if (ok) fermer();
  }

  return (
    <>
      <DataTable
        loading={unites.loading}
        error={unites.error}
        rows={unites.items}
        toolbar={
          <div className="flex flex-wrap items-center justify-between gap-4">
            {onglets}
            <button onClick={() => ouvrir(null)} className="btn-primary flex items-center gap-2">
              <Plus className="size-4" />
              Ajouter une unité
            </button>
          </div>
        }
        columns={[
          {
            label: "Nom",
            render: (u) => <CellTitle title={u.nom} icon={<Siren className="size-5" />} />,
          },
          { label: "Catégorie de service", render: (u) => categorieDe(u) },
          {
            label: "Code d'accès",
            render: (u) => (
              <code className="rounded-sm bg-background px-2 py-1 font-mono text-sm tracking-wider">
                {u.code_acces}
              </code>
            ),
          },
          { label: "Expiration", render: (u) => <Expiration unite={u} /> },
          { label: "Statut", render: (u) => <ActifDot actif={u.actif} /> },
          {
            label: "Actions",
            align: "right",
            render: (u) => (
              <RowActions
                actions={[
                  { label: "Modifier", icon: Pencil, onClick: () => ouvrir(u) },
                  {
                    label: "Supprimer",
                    icon: Trash2,
                    variant: "danger",
                    onClick: () => setDeleting(u),
                  },
                ]}
              />
            ),
          },
        ]}
        renderDetails={(u) => (
          <DetailPanel
            title="Détails de l'unité"
            items={[
              { label: "Catégorie de service", value: categorieDe(u) },
              { label: "Code d'accès", value: <code className="font-mono">{u.code_acces}</code> },
              { label: "Expiration", value: <Expiration unite={u} /> },
              { label: "Commune", value: communeDe(u) },
              { label: "Notes", value: u.notes },
            ]}
          />
        )}
      />

      <FormModal
        open={formOpen}
        title={editing ? "Modifier l'unité" : "Nouvelle unité de contrôle"}
        subtitle={editing?.nom ?? "Le code d'accès permet à l'unité de se connecter au portail."}
        onClose={fermer}
        onSubmit={onSubmit}
        submitLabel={editing ? "Enregistrer" : "Créer"}
        pending={enregistrement.pending}
        formKey={editing?.id ?? "nouvelle"}
      >
        {categories.length === 0 && (
          <p className="alert-info">
            Créez d&apos;abord une catégorie de service dans l&apos;onglet voisin.
          </p>
        )}
        <FormSection title="Unité" icon={Siren}>
          <Field label="Nom de l'unité *">
            <input
              name="nom"
              required
              defaultValue={editing?.nom}
              placeholder="Brigade routière de Toamasina"
              className="input-field"
            />
          </Field>
          <Field label="Catégorie de service *">
            <select
              name="type_corps_id"
              required
              defaultValue={editing?.type_corps_id ?? ""}
              className="input-field"
            >
              <option value="" disabled>
                Choisir une catégorie
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </Field>
        </FormSection>
        <FormSection title="Accès au portail" icon={KeyRound}>
          <Field label="Code d'accès au portail *">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  className="input-field pl-9 font-mono tracking-wider"
                />
              </div>
              <button
                type="button"
                onClick={() => setCode(genererCode())}
                title="Générer un nouveau code"
                aria-label="Générer un nouveau code"
                className="btn-ghost inline-flex items-center px-3"
              >
                <RefreshCw className="size-4" />
              </button>
            </div>
          </Field>
          <Field label="Date d'expiration">
            <DatePicker
              name="date_expiration"
              defaultValue={editing?.date_expiration}
              placeholder="Sans limite"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <textarea
                name="notes"
                rows={2}
                defaultValue={editing?.notes ?? ""}
                className="input-field"
              />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              name="actif"
              defaultChecked={editing?.actif ?? true}
              className="size-4 accent-primary"
            />
            Unité active (le code donne accès au portail)
          </label>
        </FormSection>
      </FormModal>

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer l'unité"
        message={
          <>
            Supprimer l&apos;unité <strong>{deleting?.nom}</strong> ? Son code d&apos;accès ne
            fonctionnera plus.
          </>
        }
        onConfirm={onDelete}
        onClose={fermer}
      />
    </>
  );
}
