"use client";

import { useEffect, useState } from "react";
import { Lock, Pencil, Plus, Trash2 } from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import Modal, { ConfirmDialog } from "@/components/Modal";
import PermissionsMatrix from "@/components/roles/PermissionsMatrix";
import PermissionsSummary from "@/components/roles/PermissionsSummary";
import {
  ActifDot,
  CellTitle,
  DataTable,
  DetailPanel,
  Field,
  PageHeader,
  Progress,
  RowActions,
  StatusDot,
} from "@/components/ui";
import { readForm } from "@/lib/api";
import { ESPACES, espacesDesPermissions, peutVoir } from "@/lib/espaces";
import { useAction } from "@/lib/useAction";
import { ACTIONS, MODULES, type Permissions, type Role } from "@/types";
import { useAuthStore, useRolesStore, useUsersStore } from "@/stores";

const SUPER_ADMIN = "super_admin";
const TOTAL_PERMISSIONS = Object.keys(MODULES).length * Object.keys(ACTIONS).length;

function countPermissions(p: Permissions) {
  return Object.values(p ?? {}).reduce(
    (n, actions) => n + Object.values(actions).filter(Boolean).length,
    0,
  );
}

export default function RolesPage() {
  const roles = useRolesStore();
  const users = useUsersStore((s) => s.items);
  const voitUsers = peutVoir(
    useAuthStore((s) => s.user),
    "users",
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permissions>({});
  const [deleting, setDeleting] = useState<Role | null>(null);
  const enregistrement = useAction();
  const suppression = useAction();

  useEffect(() => {
    useRolesStore.getState().fetchAll();
  }, []);

  // Pour afficher le nombre de comptes par rôle dans les détails
  useEffect(() => {
    if (voitUsers) useUsersStore.getState().fetchAll();
  }, [voitUsers]);

  function openForm(role: Role | null) {
    setEditing(role);
    setPermissions(role?.permissions ?? {});
    setFormOpen(true);
  }

  function closeModals() {
    setFormOpen(false);
    setDeleting(null);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { actif, ...values } = readForm(e.currentTarget);
    const body = { ...values, actif: actif === "on", permissions };
    const ok = await enregistrement.run(
      () => (editing ? roles.update(editing.id, body) : roles.create(body)),
      editing ? `Rôle « ${editing.nom} » modifié` : "Rôle créé",
    );
    if (ok) closeModals();
  }

  async function onDelete() {
    if (!deleting) return;
    const ok = await suppression.run(
      () => roles.remove(deleting.id),
      `Rôle « ${deleting.nom} » supprimé`,
    );
    if (ok) closeModals();
  }

  const isSuperAdmin = editing?.code === SUPER_ADMIN;

  return (
    <>
      <PageHeader
        title="Rôles"
        subtitle="Profils d'accès et permissions par module"
        action={
          <button onClick={() => openForm(null)} className="btn-primary flex items-center gap-2">
            <Plus className="size-4" />
            Ajouter un rôle
          </button>
        }
      />

      <DataTable
        loading={roles.loading}
        error={roles.error}
        rows={roles.items}
        columns={[
          {
            label: "Rôle",
            render: (r) => (
              <CellTitle
                title={r.nom}
                subtitle={<code>{r.code}</code>}
                icon={r.est_systeme ? <Lock className="size-4" /> : undefined}
              />
            ),
          },
          {
            label: "Type",
            render: (r) =>
              r.est_systeme ? (
                <StatusDot tone="primary" label="Système" />
              ) : (
                <StatusDot tone="muted" label="Personnalisé" />
              ),
          },
          {
            label: "Espaces",
            render: (r) => {
              const espaces =
                r.code === SUPER_ADMIN ? ESPACES : espacesDesPermissions(r.permissions);
              if (espaces.length === 0) return <span className="text-text-muted">Aucun</span>;
              return (
                <div className="flex flex-wrap gap-1.5">
                  {espaces.map((e) => (
                    <span
                      key={e.id}
                      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold ${e.couleur.douce}`}
                    >
                      <e.icon className="size-3.5" />
                      {e.titre}
                    </span>
                  ))}
                </div>
              );
            },
          },
          {
            label: "Permissions",
            render: (r) =>
              r.code === SUPER_ADMIN ? (
                <Progress value={1} max={1} tone="success" label="Total" />
              ) : (
                <Progress
                  value={countPermissions(r.permissions)}
                  max={TOTAL_PERMISSIONS}
                  label={`${countPermissions(r.permissions)}/${TOTAL_PERMISSIONS}`}
                />
              ),
          },
          { label: "Statut", render: (r) => <ActifDot actif={r.actif} /> },
          {
            label: "Actions",
            align: "right",
            render: (r) => (
              <RowActions
                actions={[
                  { label: "Modifier", icon: Pencil, onClick: () => openForm(r) },
                  {
                    label: "Supprimer",
                    icon: Trash2,
                    variant: "danger",
                    disabled: r.est_systeme,
                    hint: "Rôle système : suppression impossible",
                    onClick: () => setDeleting(r),
                  },
                ]}
              />
            ),
          },
        ]}
        renderDetails={(r) => (
          <DetailPanel
            title="Détails du rôle"
            items={[
              { label: "Code", value: <code>{r.code}</code> },
              { label: "Description", value: r.description },
              {
                label: "Utilisateurs",
                value: voitUsers
                  ? `${users.filter((u) => String(u.role_id) === String(r.id)).length} compte(s)`
                  : undefined,
              },
              {
                label: "Protection",
                value: r.est_systeme ? "Rôle système, non supprimable" : "Aucune",
              },
            ]}
          >
            <div>
              <p className="card-title mb-3">Permissions accordées</p>
              {r.code === SUPER_ADMIN ? (
                <p className="alert-info">Super administrateur : accès à tous les modules.</p>
              ) : (
                <PermissionsSummary permissions={r.permissions} />
              )}
            </div>
          </DetailPanel>
        )}
      />

      <Modal
        open={formOpen}
        title={editing ? `Modifier le rôle : ${editing.nom}` : "Nouveau rôle"}
        onClose={closeModals}
        size="lg"
      >
        <form key={editing?.id ?? "new"} onSubmit={onSubmit} className="space-y-4">
          {editing?.est_systeme && (
            <p className="alert-info flex items-center gap-2">
              <Lock className="size-4 shrink-0" />
              Rôle système : son code ne peut pas être modifié et il ne peut pas être supprimé.
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Code *">
              <input
                name="code"
                required
                pattern="[a-z_]+"
                title="Minuscules et _ uniquement"
                defaultValue={editing?.code}
                disabled={!!editing}
                className="input-field disabled:bg-background disabled:text-text-muted"
              />
            </Field>
            <Field label="Nom *">
              <input name="nom" required defaultValue={editing?.nom} className="input-field" />
            </Field>
          </div>
          <Field label="Description">
            <input
              name="description"
              defaultValue={editing?.description ?? ""}
              className="input-field"
            />
          </Field>

          <div>
            <span className="label-field">Permissions</span>
            {isSuperAdmin ? (
              <p className="alert-info">
                Le super administrateur a accès à tous les modules, ses permissions ne sont pas
                modifiables.
              </p>
            ) : (
              <PermissionsMatrix value={permissions} onChange={setPermissions} />
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="actif"
              defaultChecked={editing?.actif ?? true}
              className="size-4 accent-primary"
            />
            Rôle actif
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeModals}
              disabled={enregistrement.pending}
              className="btn-ghost"
            >
              Annuler
            </button>
            <LoadingButton type="submit" loading={enregistrement.pending} className="btn-primary">
              {editing ? "Enregistrer" : "Créer"}
            </LoadingButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer le rôle"
        message={
          <>
            Supprimer le rôle <strong>{deleting?.nom}</strong> ? Les utilisateurs qui l&apos;ont
            perdront leurs accès.
          </>
        }
        onConfirm={onDelete}
        onClose={closeModals}
      />
    </>
  );
}
