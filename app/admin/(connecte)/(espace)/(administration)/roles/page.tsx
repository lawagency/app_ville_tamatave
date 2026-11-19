"use client";

import { useEffect, useState } from "react";
import { Home, IdCard, Lock, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import FormModal, { FormSection } from "@/components/FormModal";
import { ConfirmDialog } from "@/components/Modal";
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
// Profil réservé à l'espace propriétaire : aucune permission d'administration
const PROPRIETAIRE = "proprietaire";
const TOTAL_PERMISSIONS = Object.keys(MODULES).length * Object.keys(ACTIONS).length;

const TEXTE_PROPRIETAIRE =
  "Ce rôle donne accès uniquement à l'espace propriétaire (/proprietaire). Il n'ouvre aucun module de l'administration : la gestion des propriétaires se fait par la mairie dans la page Propriétaires.";

function EspaceProprietaire() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-accent/20 px-2 py-1 text-xs font-semibold text-text-main">
      <Home className="size-3.5" />
      Espace propriétaire
    </span>
  );
}

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
  const isProprietaire = editing?.code === PROPRIETAIRE;

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
              if (r.code === PROPRIETAIRE) return <EspaceProprietaire />;
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
              r.code === PROPRIETAIRE ? (
                <span className="text-text-muted">Sans objet</span>
              ) : r.code === SUPER_ADMIN ? (
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
              {r.code === PROPRIETAIRE ? (
                <p className="alert-info">{TEXTE_PROPRIETAIRE}</p>
              ) : r.code === SUPER_ADMIN ? (
                <p className="alert-info">Super administrateur : accès à tous les modules.</p>
              ) : (
                <PermissionsSummary permissions={r.permissions} />
              )}
            </div>
          </DetailPanel>
        )}
      />

      <FormModal
        size="lg"
        open={formOpen}
        title={editing ? "Modifier le rôle" : "Nouveau rôle"}
        subtitle={editing?.nom ?? "Cochez un espace pour tout lui accorder, puis affinez."}
        onClose={closeModals}
        onSubmit={onSubmit}
        submitLabel={editing ? "Enregistrer" : "Créer"}
        pending={enregistrement.pending}
        formKey={editing?.id ?? "nouveau"}
      >
        {editing?.est_systeme && (
          <p className="alert-info flex items-center gap-2">
            <Lock className="size-4 shrink-0" />
            Rôle système : son code ne peut pas être modifié et il ne peut pas être supprimé.
          </p>
        )}

        <FormSection title="Informations" icon={IdCard}>
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
          <div className="sm:col-span-2">
            <Field label="Description">
              <input
                name="description"
                defaultValue={editing?.description ?? ""}
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
            Rôle actif
          </label>
        </FormSection>

        <FormSection title="Espaces et permissions" icon={ShieldCheck} columns={1}>
          {isProprietaire ? (
            <p className="alert-info">{TEXTE_PROPRIETAIRE}</p>
          ) : isSuperAdmin ? (
            <p className="alert-info">
              Le super administrateur a accès à tous les modules, ses permissions ne sont pas
              modifiables.
            </p>
          ) : (
            <PermissionsMatrix value={permissions} onChange={setPermissions} />
          )}
        </FormSection>
      </FormModal>

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
