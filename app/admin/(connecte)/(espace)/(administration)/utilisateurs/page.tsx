"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Ban,
  Check,
  KeyRound,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import FormModal, { FormSection } from "@/components/FormModal";
import { ConfirmDialog } from "@/components/Modal";
import PasswordInput from "@/components/PasswordInput";
import PermissionsSummary from "@/components/roles/PermissionsSummary";
import RoleBadge from "@/components/roles/RoleBadge";
import StatutBadge from "@/components/users/StatutBadge";
import UserCell, { TelephoneCell } from "@/components/users/UserCell";
import ValidePar from "@/components/users/ValidePar";
import {
  DataTable,
  DetailPanel,
  Field,
  FilterTabs,
  PageHeader,
  RowActions,
  type Tone,
} from "@/components/ui";
import { TelephoneInput } from "@/components/FormatInput";
import { formatDate, formatDateTime, readForm } from "@/lib/api";
import { afficherTelephone } from "@/lib/formats";
import { useAction } from "@/lib/useAction";
import { STATUTS_USER, type StatutUser, type User } from "@/types";
import { useRolesStore, useUsersStore } from "@/stores";

type Onglet = "tous" | StatutUser;

const ONGLETS: { key: Onglet; label: string; tone: Tone }[] = [
  { key: "tous", label: "Tous", tone: "primary" },
  { key: "en_attente", label: "En attente", tone: "warning" },
  { key: "actif", label: "Actifs", tone: "success" },
  { key: "inactif", label: "Inactifs", tone: "muted" },
  { key: "rejete", label: "Rejetés", tone: "danger" },
  { key: "suspendu", label: "Suspendus", tone: "danger" },
];

const dansOnglet = (u: User, onglet: Onglet) => onglet === "tous" || u.statut === onglet;

/** Changements de statut qui demandent une confirmation. */
type StatutConfirme = "rejete" | "suspendu";

const CONFIRMATIONS: Record<
  StatutConfirme,
  { titre: string; bouton: string; explication: string }
> = {
  rejete: {
    titre: "Rejeter la demande",
    bouton: "Rejeter",
    explication:
      "Refus initial de la demande, par exemple pour des documents faux ou incomplets. Le compte ne pourra pas se connecter.",
  },
  suspendu: {
    titre: "Suspendre le compte",
    bouton: "Suspendre",
    explication:
      "Blocage temporaire, par exemple pour une faute ou une enquête en cours. Le compte pourra être réactivé plus tard.",
  },
};

export default function UtilisateursPage() {
  const users = useUsersStore();
  const roles = useRolesStore((s) => s.items);

  const [search, setSearch] = useState("");
  const [roleFiltre, setRoleFiltre] = useState("");
  const [onglet, setOnglet] = useState<Onglet>("tous");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [confirmation, setConfirmation] = useState<{
    user: User;
    statut: StatutConfirme;
  } | null>(null);
  const enregistrement = useAction();
  const action = useAction();

  useEffect(() => {
    useUsersStore.getState().fetchAll();
    useRolesStore.getState().fetchAll();
  }, []);

  // Les id BIGINT arrivent en texte depuis PostgreSQL : on compare en texte
  const roleDe = (id: number) => roles.find((r) => String(r.id) === String(id));

  // Recherche et rôle d'abord : les compteurs des onglets reflètent ces filtres
  const q = search.trim().toLowerCase();
  const base = users.items.filter(
    (u) =>
      (!q || [u.nom, u.prenom, u.email, u.telephone].some((v) => v?.toLowerCase().includes(q))) &&
      (!roleFiltre || String(u.role_id) === roleFiltre),
  );
  const rows = base.filter((u) => dansOnglet(u, onglet));

  const nomDe = (u: User) => `${u.prenom} ${u.nom}`;

  function openForm(user: User | null) {
    setEditing(user);
    setFormOpen(true);
  }

  function closeModals() {
    setFormOpen(false);
    setDeleting(null);
    setConfirmation(null);
  }

  function demanderConfirmation(user: User, statut: StatutConfirme) {
    setConfirmation({ user, statut });
  }

  function changerStatut(user: User, statut: StatutUser, message: string) {
    return action.run(() => users.update(user.id, { statut }), message);
  }

  async function onConfirm() {
    if (!confirmation) return;
    const { user, statut } = confirmation;
    const message =
      statut === "rejete"
        ? `Demande de ${nomDe(user)} rejetée`
        : `Compte de ${nomDe(user)} suspendu`;
    if (await changerStatut(user, statut, message)) closeModals();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = readForm(e.currentTarget, ["role_id"]);
    const ok = await enregistrement.run(
      () => (editing ? users.update(editing.id, values) : users.create(values)),
      editing ? "Utilisateur modifié" : "Utilisateur créé, en attente de validation",
    );
    if (ok) closeModals();
  }

  async function onDelete() {
    if (!deleting) return;
    const ok = await action.run(
      () => users.remove(deleting.id),
      `Compte de ${nomDe(deleting)} supprimé`,
    );
    if (ok) closeModals();
  }

  return (
    <>
      <PageHeader
        title="Utilisateurs"
        subtitle="Comptes des agents ayant accès à la plateforme"
        action={
          <button onClick={() => openForm(null)} className="btn-primary flex items-center gap-2">
            <Plus className="size-4" />
            Ajouter un utilisateur
          </button>
        }
      />

      <DataTable
        loading={users.loading}
        error={users.error}
        rows={rows}
        toolbar={
          <div className="flex flex-wrap items-center gap-4">
            <FilterTabs
              value={onglet}
              onChange={setOnglet}
              tabs={ONGLETS.map((o) => ({
                ...o,
                count: base.filter((u) => dansOnglet(u, o.key)).length,
              }))}
            />
            {/* Recherche et rôle restent ensemble : ils passent à la ligne d'un bloc */}
            <div className="flex min-w-80 flex-1 items-center gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher par nom, email ou téléphone…"
                  className="input-field pl-9"
                />
              </div>
              <select
                value={roleFiltre}
                onChange={(e) => setRoleFiltre(e.target.value)}
                className="input-field w-48 shrink-0"
              >
                <option value="">Tous les rôles</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>
        }
        columns={[
          { label: "Utilisateur", render: (u) => <UserCell user={u} /> },
          { label: "Téléphone", render: (u) => <TelephoneCell user={u} /> },
          {
            label: "Rôle",
            render: (u) => <RoleBadge role={roleDe(u.role_id)} roles={roles} />,
          },
          {
            label: "Statut",
            render: (u) => (
              <div className="flex flex-col items-start gap-1">
                <StatutBadge statut={u.statut} />
                <span className="text-xs text-text-muted">
                  {u.date_validation ? `Validé le ${formatDate(u.date_validation)}` : "--"}
                </span>
              </div>
            ),
          },
          {
            label: "Actions",
            align: "right",
            render: (u) => (
              <RowActions
                actions={[
                  {
                    label: "Valider",
                    icon: Check,
                    variant: "success",
                    visible: u.statut === "en_attente",
                    onClick: () => changerStatut(u, "actif", `Compte de ${nomDe(u)} validé`),
                  },
                  {
                    label: "Rejeter",
                    icon: X,
                    variant: "danger",
                    visible: u.statut === "en_attente",
                    onClick: () => demanderConfirmation(u, "rejete"),
                  },
                  {
                    label: "Suspendre",
                    icon: Ban,
                    variant: "danger",
                    visible: u.statut === "actif",
                    onClick: () => demanderConfirmation(u, "suspendu"),
                  },
                  {
                    label: "Réactiver",
                    icon: RotateCcw,
                    variant: "success",
                    visible: u.statut === "suspendu",
                    onClick: () => changerStatut(u, "actif", `Compte de ${nomDe(u)} réactivé`),
                  },
                  { label: "Modifier", icon: Pencil, onClick: () => openForm(u) },
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
        renderDetails={(u) => {
          const role = roleDe(u.role_id);
          return (
            <DetailPanel
              title="Détails du compte"
              items={[
                { label: "Nom", value: u.nom.toUpperCase() },
                { label: "Prénom", value: u.prenom },
                { label: "Email", value: u.email },
                { label: "Téléphone", value: afficherTelephone(u.telephone) },
                { label: "Rôle", value: <RoleBadge role={role} roles={roles} /> },
                { label: "Dernière connexion", value: formatDateTime(u.derniere_connexion) },
                { label: "Date de validation", value: formatDateTime(u.date_validation) },
                { label: "Validé par", value: <ValidePar userId={u.id} /> },
                {
                  label: "Statut",
                  value: (
                    <span className="flex flex-col items-start gap-1">
                      <StatutBadge statut={u.statut} />
                      <span className="text-xs text-text-muted">
                        {STATUTS_USER[u.statut]?.description}
                      </span>
                    </span>
                  ),
                },
              ]}
            >
              {role && (
                <div>
                  <p className="card-title mb-3">Accès donnés par le rôle</p>
                  {role.code === "super_admin" ? (
                    <p className="alert-info">Super administrateur : accès à tous les modules.</p>
                  ) : (
                    <PermissionsSummary permissions={role.permissions} />
                  )}
                </div>
              )}
            </DetailPanel>
          );
        }}
      />

      <FormModal
        open={formOpen}
        title={editing ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
        subtitle={editing ? nomDe(editing) : "Le compte sera créé en attente de validation."}
        onClose={closeModals}
        onSubmit={onSubmit}
        submitLabel={editing ? "Enregistrer" : "Créer le compte"}
        pending={enregistrement.pending}
        formKey={editing?.id ?? "nouveau"}
      >
        <FormSection title="Identité" icon={UserRound}>
          <Field label="Nom *">
            <input name="nom" required defaultValue={editing?.nom} className="input-field" />
          </Field>
          <Field label="Prénom *">
            <input name="prenom" required defaultValue={editing?.prenom} className="input-field" />
          </Field>
          <Field label="Téléphone">
            <TelephoneInput name="telephone" defaultValue={editing?.telephone} />
          </Field>
        </FormSection>

        <FormSection title="Connexion et accès" icon={KeyRound}>
          <Field label="Email *">
            <input
              name="email"
              type="email"
              required
              defaultValue={editing?.email}
              disabled={!!editing}
              className="input-field disabled:bg-background disabled:text-text-muted"
            />
          </Field>
          <Field label={editing ? "Nouveau mot de passe" : "Mot de passe *"}>
            <PasswordInput
              name="password"
              autoComplete="new-password"
              required={!editing}
              minLength={6}
              placeholder={editing ? "Laisser vide pour ne pas changer" : "6 caractères minimum"}
              className="input-field"
            />
          </Field>
          <Field label="Rôle *">
            <select
              name="role_id"
              required
              defaultValue={editing?.role_id ?? ""}
              className="input-field"
            >
              <option value="" disabled>
                Choisir un rôle
              </option>
              {/* Les comptes propriétaires se créent depuis la page Propriétaires (fiche liée) */}
              {roles
                .filter((r) => r.code !== "proprietaire" || r.id === editing?.role_id)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nom}
                  </option>
                ))}
            </select>
          </Field>
          <p className="text-xs text-text-muted sm:col-span-2">
            Le compte d&apos;un propriétaire se crée depuis sa fiche, dans la page{" "}
            <Link href="/admin/proprietaires" className="font-semibold text-primary">
              Propriétaires
            </Link>{" "}
            (menu ⋮ → Créer son compte).
          </p>
        </FormSection>
      </FormModal>

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer l'utilisateur"
        message={
          <>
            Supprimer le compte de{" "}
            <strong>
              {deleting?.prenom} {deleting?.nom}
            </strong>{" "}
            ? Cette action est définitive.
          </>
        }
        onConfirm={onDelete}
        onClose={closeModals}
      />

      {confirmation && (
        <ConfirmDialog
          open
          title={CONFIRMATIONS[confirmation.statut].titre}
          confirmLabel={CONFIRMATIONS[confirmation.statut].bouton}
          message={
            <>
              <strong>
                {confirmation.user.prenom} {confirmation.user.nom}
              </strong>
              <span className="mt-2 block text-sm text-text-muted">
                {CONFIRMATIONS[confirmation.statut].explication}
              </span>
            </>
          }
          onConfirm={onConfirm}
          onClose={closeModals}
        />
      )}
    </>
  );
}
