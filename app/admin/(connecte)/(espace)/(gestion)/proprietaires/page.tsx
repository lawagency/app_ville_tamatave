"use client";

import { useEffect, useState } from "react";
import {
  Ban,
  CircleCheck,
  CircleMinus,
  CircleX,
  Clock,
  Contact,
  FileWarning,
  Hash,
  IdCard,
  KeyRound,
  NotebookPen,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import DatePicker from "@/components/DatePicker";
import FormModal, { FormSection } from "@/components/FormModal";
import { ConfirmDialog } from "@/components/Modal";
import PasswordInput from "@/components/PasswordInput";
import PhotoInput from "@/components/PhotoInput";
import StatutBadge from "@/components/users/StatutBadge";
import {
  CellTitle,
  DataTable,
  DetailPanel,
  Field,
  PageHeader,
  RowActions,
  StatusDot,
} from "@/components/ui";
import { CinInput, TelephoneInput } from "@/components/FormatInput";
import { api, fichierUrl, formatDate } from "@/lib/api";
import { afficherTelephone, chiffres, formaterCin } from "@/lib/formats";
import { useAction } from "@/lib/useAction";
import { STATUTS_FICHE, type Proprietaire, type StatutFiche } from "@/types";
import { useProprietairesStore, useUiStore } from "@/stores";

/** Action du menu ⋮ qui fait passer la fiche à ce statut. */
const ACTIONS_STATUT: Record<
  StatutFiche,
  { label: string; icon: LucideIcon; variant?: "success" | "danger" }
> = {
  actif: { label: "Valider la fiche", icon: CircleCheck, variant: "success" },
  en_verification: { label: "Remettre en vérification", icon: Clock },
  dossier_incomplet: { label: "Dossier incomplet", icon: FileWarning },
  suspendu: { label: "Suspendre", icon: Ban, variant: "danger" },
  inactif: { label: "Désactiver", icon: CircleMinus },
  radie: { label: "Radier", icon: CircleX, variant: "danger" },
};

const statutDe = (p: Proprietaire): StatutFiche => p.statut ?? "en_verification";

const CHAMPS_TEXTE = [
  "nom",
  "prenom",
  "lieu_naissance",
  "telephone_principal",
  "telephone_secondaire",
  "adresse",
  "profession",
  "cin",
  "notes",
];

/** Corps envoyé à l'API : les champs vidés sont envoyés vides pour être effacés. */
function corpsDuFormulaire(form: HTMLFormElement, creerCompte: boolean) {
  const saisie = new FormData(form);
  const texte = (champ: string) => String(saisie.get(champ) ?? "").trim();
  const body: Record<string, string | boolean> = {};
  for (const champ of CHAMPS_TEXTE) body[champ] = texte(champ);
  // Champs validés par format côté API : omis s'ils sont vides
  for (const champ of ["email", "date_naissance", "sexe"]) {
    if (texte(champ)) body[champ] = texte(champ);
  }
  if (creerCompte) {
    body.creer_compte = true;
    body.mot_de_passe = String(saisie.get("mot_de_passe") ?? "");
  }
  return body;
}

/** Mot de passe initial de 10 caractères, à transmettre au propriétaire. */
function genererMotDePasse() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const octets = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(octets, (o) => alphabet[o % alphabet.length]).join("");
}

export default function ProprietairesPage() {
  const proprietaires = useProprietairesStore();
  const search = useUiStore((s) => s.proprietaireSearch);
  const setSearch = useUiStore((s) => s.setProprietaireSearch);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Proprietaire | null>(null);
  const [deleting, setDeleting] = useState<Proprietaire | null>(null);
  const [changement, setChangement] = useState<{
    proprietaire: Proprietaire;
    statut: StatutFiche;
  } | null>(null);
  const [prochain, setProchain] = useState<string | null>(null);
  const [creerCompte, setCreerCompte] = useState(true);
  const [motDePasse, setMotDePasse] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const enregistrement = useAction();
  const suppression = useAction();
  const changementStatut = useAction();

  useEffect(() => {
    useProprietairesStore.getState().fetchAll();
  }, []);

  const q = search.trim().toLowerCase();
  const rows = proprietaires.items.filter((p) =>
    [p.identifiant, p.nom, p.prenom, p.telephone_principal, p.cin].some(
      (v) =>
        v?.toLowerCase().includes(q) ||
        // Recherche par chiffres : « 034 12 », « 3012456 »… quel que soit le format saisi
        (chiffres(q).length >= 3 && v?.replace(/\D/g, "").includes(chiffres(q).replace(/^0/, ""))),
    ),
  );

  const nomDe = (p: Proprietaire) => `${p.prenom} ${p.nom.toUpperCase()}`;

  function ouvrir(p: Proprietaire | null, avecCompte = false) {
    setEditing(p);
    setProchain(null);
    // À la création, le compte est proposé par défaut ; en modification, à la demande
    setCreerCompte(!p || avecCompte);
    setMotDePasse(genererMotDePasse());
    setPhoto(null);
    setFormOpen(true);
    // Aperçu seulement : l'API attribue l'identifiant à l'enregistrement
    if (!p) {
      api<{ identifiant: string }>("/parametres-indentifiants/prochain/proprietaire")
        .then((r) => setProchain(r.identifiant))
        .catch(() => setProchain(null));
    }
  }

  function fermer() {
    setFormOpen(false);
    setDeleting(null);
    setChangement(null);
  }

  async function onChangerStatut(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!changement) return;
    const { proprietaire, statut } = changement;
    // La justification est obligatoire : elle va dans l'historique des statuts
    const justification = String(new FormData(e.currentTarget).get("justification") ?? "").trim();
    const ok = await changementStatut.run(
      () =>
        proprietaires.update(proprietaire.id, { statut, justification_statut: justification }),
      `Fiche de ${nomDe(proprietaire)} : ${STATUTS_FICHE[statut].label.toLowerCase()}`,
    );
    if (ok) fermer();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const avecCompte = creerCompte && !editing?.user_id;
    const body = corpsDuFormulaire(e.currentTarget, avecCompte);
    const ok = await enregistrement.run(
      async () => {
        const fiche = editing
          ? await proprietaires.update(editing.id, body)
          : await proprietaires.create(body);
        // La photo part après la fiche : sa route a besoin de l'id et de l'identifiant
        if (photo) {
          const envoi = new FormData();
          envoi.append("photo", photo);
          await api(`/proprietaires/${fiche.id}/photo`, "POST", envoi);
          await proprietaires.fetchAll({ force: true });
        }
      },
      avecCompte
        ? `Propriétaire enregistré, compte actif pour ${body.email}`
        : editing
          ? "Propriétaire modifié"
          : "Propriétaire enregistré",
    );
    if (ok) fermer();
  }

  async function onDelete() {
    if (!deleting) return;
    const ok = await suppression.run(
      () => proprietaires.remove(deleting.id),
      `Propriétaire ${nomDe(deleting)} supprimé`,
    );
    if (ok) fermer();
  }

  return (
    <>
      <PageHeader
        title="Propriétaires"
        subtitle="Propriétaires de véhicules enregistrés"
        action={
          <button onClick={() => ouvrir(null)} className="btn-primary flex items-center gap-2">
            <Plus className="size-4" />
            Nouveau propriétaire
          </button>
        }
      />

      <DataTable
        loading={proprietaires.loading}
        error={proprietaires.error}
        rows={rows}
        toolbar={
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, identifiant, CIN ou téléphone…"
              className="input-field pl-9"
            />
          </div>
        }
        columns={[
          {
            label: "Propriétaire",
            render: (p) => (
              <CellTitle
                title={nomDe(p)}
                subtitle={<code>{p.identifiant}</code>}
                photo={fichierUrl(p.photo_chemin)}
              />
            ),
          },
          { label: "Téléphone", render: (p) => afficherTelephone(p.telephone_principal) },
          { label: "CIN", render: (p) => formaterCin(p.cin) || "—" },
          {
            // Statut du compte de connexion (users.statut)
            label: "Compte",
            render: (p) =>
              p.user_id ? (
                <StatutBadge statut={p.compte_statut ?? "actif"} />
              ) : (
                <StatusDot tone="muted" label="Pas de compte" />
              ),
          },
          {
            // Statut de la fiche (proprietaires.statut)
            label: "Statut",
            render: (p) => {
              const { label, tone } = STATUTS_FICHE[statutDe(p)];
              return <StatusDot tone={tone} label={label} />;
            },
          },
          { label: "Enregistré le", render: (p) => formatDate(p.created_at) },
          {
            label: "Actions",
            align: "right",
            render: (p) => (
              <RowActions
                actions={[
                  {
                    label: "Créer son compte",
                    icon: KeyRound,
                    variant: "success",
                    visible: !p.user_id,
                    onClick: () => ouvrir(p, true),
                  },
                  { label: "Modifier", icon: Pencil, onClick: () => ouvrir(p) },
                  ...(Object.keys(ACTIONS_STATUT) as StatutFiche[]).map((statut) => ({
                    ...ACTIONS_STATUT[statut],
                    visible: statut !== statutDe(p),
                    onClick: () => setChangement({ proprietaire: p, statut }),
                  })),
                  {
                    label: "Supprimer",
                    icon: Trash2,
                    variant: "danger",
                    onClick: () => setDeleting(p),
                  },
                ]}
              />
            ),
          },
        ]}
        renderDetails={(p) => (
          <DetailPanel
            title="Fiche du propriétaire"
            items={[
              { label: "Identifiant", value: <code>{p.identifiant}</code> },
              { label: "Nom", value: p.nom.toUpperCase() },
              { label: "Prénom", value: p.prenom },
              {
                label: "Sexe",
                value: p.sexe === "M" ? "Masculin" : p.sexe === "F" ? "Féminin" : undefined,
              },
              { label: "CIN", value: formaterCin(p.cin) },
              {
                label: "Naissance",
                value: p.date_naissance
                  ? `${formatDate(p.date_naissance)}${p.lieu_naissance ? ` à ${p.lieu_naissance}` : ""}`
                  : p.lieu_naissance,
              },
              { label: "Profession", value: p.profession },
              { label: "Téléphone principal", value: afficherTelephone(p.telephone_principal) },
              { label: "Téléphone secondaire", value: afficherTelephone(p.telephone_secondaire) },
              { label: "Email", value: p.email },
              { label: "Adresse", value: p.adresse },
              { label: "Enregistré le", value: formatDate(p.created_at) },
              { label: "Statut de la fiche", value: STATUTS_FICHE[statutDe(p)].label },
              {
                label: "Compte de l'espace propriétaire",
                value: p.user_id ? (p.compte_email ?? "Oui") : "Pas de compte",
              },
              { label: "Notes", value: p.notes },
            ]}
          />
        )}
      />

      <FormModal
        size="lg"
        open={formOpen}
        title={editing ? "Modifier le propriétaire" : "Nouveau propriétaire"}
        subtitle={editing ? nomDe(editing) : "Les champs marqués * sont obligatoires."}
        onClose={fermer}
        onSubmit={onSubmit}
        submitLabel={editing ? "Enregistrer" : "Créer"}
        pending={enregistrement.pending}
        formKey={editing?.id ?? "nouveau"}
      >
        <PhotoInput
          actuelle={fichierUrl(editing?.photo_chemin)}
          fichier={photo}
          onChange={setPhoto}
        />

        <FormSection columns={3} title="Identité" icon={UserRound}>
          <Field label="Nom *">
            <input name="nom" required defaultValue={editing?.nom} className="input-field" />
          </Field>
          <Field label="Prénom *">
            <input name="prenom" required defaultValue={editing?.prenom} className="input-field" />
          </Field>
          <Field label="Sexe">
            <select name="sexe" defaultValue={editing?.sexe ?? ""} className="input-field">
              <option value="">Non précisé</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </Field>
          <Field label="Profession">
            <input
              name="profession"
              defaultValue={editing?.profession ?? ""}
              className="input-field"
            />
          </Field>
          <Field label="Date de naissance">
            <DatePicker name="date_naissance" defaultValue={editing?.date_naissance} />
          </Field>
          <Field label="Lieu de naissance">
            <input
              name="lieu_naissance"
              defaultValue={editing?.lieu_naissance ?? ""}
              className="input-field"
            />
          </Field>
        </FormSection>

        <FormSection title="Pièces d'identité" icon={IdCard}>
          <Field label="Identifiant">
            <div className="input-field flex items-center gap-2 bg-background">
              <Hash className="size-4 shrink-0 text-text-muted" />
              {editing ? (
                <code className="font-mono font-semibold text-primary">{editing.identifiant}</code>
              ) : prochain ? (
                <>
                  <code className="font-mono font-semibold text-primary">{prochain}</code>
                  <span className="text-xs text-text-muted">attribué automatiquement</span>
                </>
              ) : (
                <span className="text-sm text-text-muted">Attribué automatiquement</span>
              )}
            </div>
          </Field>
          <Field label="CIN">
            <CinInput name="cin" defaultValue={editing?.cin} />
          </Field>
        </FormSection>

        <FormSection columns={3} title="Contact" icon={Contact}>
          <Field label="Téléphone principal *">
            <TelephoneInput
              name="telephone_principal"
              required
              defaultValue={editing?.telephone_principal}
            />
          </Field>
          <Field label="Téléphone secondaire">
            <TelephoneInput
              name="telephone_secondaire"
              defaultValue={editing?.telephone_secondaire}
            />
          </Field>
          <Field label={creerCompte && !editing?.user_id ? "Email *" : "Email"}>
            <input
              name="email"
              type="email"
              required={creerCompte && !editing?.user_id}
              defaultValue={editing?.email ?? ""}
              className="input-field"
            />
          </Field>
          {/* Dernier champ seul sur sa ligne : il prend toute la largeur */}
          <div className="sm:col-span-2 lg:col-span-3">
            <Field label="Adresse">
              <input
                name="adresse"
                defaultValue={editing?.adresse ?? ""}
                placeholder="Lot, quartier, fokontany"
                className="input-field"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Espace propriétaire" icon={KeyRound} columns={1}>
          {editing?.user_id ? (
            <p className="alert-info flex items-center gap-2">
              <CircleCheck className="size-4 shrink-0" />
              Compte déjà créé : le propriétaire se connecte avec{" "}
              <strong>{editing.compte_email ?? editing.email}</strong>.
            </p>
          ) : (
            <>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={creerCompte}
                  onChange={(e) => setCreerCompte(e.target.checked)}
                  className="mt-0.5 size-4 accent-primary"
                />
                <span>
                  <span className="block font-medium">Créer son compte d&apos;accès</span>
                  <span className="block text-text-muted">
                    Le propriétaire pourra se connecter à son espace avec son email et ce mot de
                    passe. Le compte est actif tout de suite, puisque la mairie a vérifié ses
                    pièces.
                  </span>
                </span>
              </label>
              {creerCompte && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Mot de passe initial *">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <PasswordInput
                          name="mot_de_passe"
                          value={motDePasse}
                          onChange={(e) => setMotDePasse(e.target.value)}
                          required
                          minLength={6}
                          autoComplete="new-password"
                          className="input-field font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setMotDePasse(genererMotDePasse())}
                        title="Générer un autre mot de passe"
                        aria-label="Générer un autre mot de passe"
                        className="btn-ghost px-3"
                      >
                        <RefreshCw className="size-4" />
                      </button>
                    </div>
                  </Field>
                  <p className="self-end pb-2 text-xs text-text-muted">
                    Transmettez-le au propriétaire : il ne sera plus affiché après
                    l&apos;enregistrement.
                  </p>
                </div>
              )}
            </>
          )}
        </FormSection>

        <FormSection title="Notes" icon={NotebookPen} columns={1}>
          <textarea
            name="notes"
            rows={3}
            defaultValue={editing?.notes ?? ""}
            placeholder="Informations utiles pour la mairie (pièces manquantes, remarques…)"
            aria-label="Notes"
            className="input-field"
          />
        </FormSection>
      </FormModal>

      <FormModal
        size="sm"
        open={changement !== null}
        title={changement ? ACTIONS_STATUT[changement.statut].label : ""}
        subtitle={
          changement
            ? `${nomDe(changement.proprietaire)} : ${STATUTS_FICHE[statutDe(changement.proprietaire)].label} → ${STATUTS_FICHE[changement.statut].label}`
            : undefined
        }
        onClose={fermer}
        onSubmit={onChangerStatut}
        submitLabel="Changer le statut"
        pending={changementStatut.pending}
        formKey={changement ? `${changement.proprietaire.id}-${changement.statut}` : "statut"}
      >
        <Field label="Justification *">
          <textarea
            name="justification"
            rows={3}
            required
            placeholder="Raison du changement, conservée dans l'historique de la fiche"
            className="input-field"
          />
        </Field>
      </FormModal>

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer le propriétaire"
        message={
          <>
            Supprimer <strong>{deleting && nomDe(deleting)}</strong> ? Cette action est définitive.
          </>
        }
        onConfirm={onDelete}
        onClose={fermer}
      />
    </>
  );
}
