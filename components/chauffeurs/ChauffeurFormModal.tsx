"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  CircleCheck,
  Contact,
  Hash,
  IdCard,
  KeyRound,
  NotebookPen,
  RefreshCw,
  UserRound,
} from "lucide-react";
import DatePicker from "@/components/DatePicker";
import FormModal, { FormSection } from "@/components/FormModal";
import { CinInput, TelephoneInput } from "@/components/FormatInput";
import PasswordInput from "@/components/PasswordInput";
import PhotoInput from "@/components/PhotoInput";
import { Field } from "@/components/ui";
import { api, fichierUrl } from "@/lib/api";
import { peutVoir } from "@/lib/espaces";
import { useAction } from "@/lib/useAction";
import type { Chauffeur, TypeChauffeurPropose } from "@/types";
import {
  useAuthStore,
  useChauffeursStore,
  useMesChauffeursStore,
  useProprietairesStore,
  useTypesChauffeursStore,
} from "@/stores";
import { nomChauffeur } from "./ChauffeurStatutModals";

const CHAMPS_TEXTE = ["nom", "prenom", "lieu_naissance", "telephone", "adresse", "cin", "notes"];

/** Corps envoyé à l'API : les champs vidés sont envoyés vides pour être effacés. */
function corpsDuFormulaire(form: HTMLFormElement, creerCompte: boolean) {
  const saisie = new FormData(form);
  const texte = (champ: string) => String(saisie.get(champ) ?? "").trim();
  const body: Record<string, string | number | boolean | null> = {
    type_chauffeur_id: Number(texte("type_chauffeur_id")),
  };
  for (const champ of CHAMPS_TEXTE) body[champ] = texte(champ);
  // Champs validés par format côté API : omis s'ils sont vides
  for (const champ of ["email", "date_naissance"]) {
    if (texte(champ)) body[champ] = texte(champ);
  }
  // Liste présente seulement côté mairie ; vide : plus rattaché à un propriétaire
  if (saisie.has("proprietaire_id")) {
    body.proprietaire_id = texte("proprietaire_id") ? Number(texte("proprietaire_id")) : null;
  }
  if (creerCompte) {
    body.creer_compte = true;
    body.mot_de_passe = String(saisie.get("mot_de_passe") ?? "");
  }
  return body;
}

/** Mot de passe initial de 10 caractères, à transmettre au chauffeur. */
function genererMotDePasse() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const octets = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(octets, (o) => alphabet[o % alphabet.length]).join("");
}

type TypePropose = TypeChauffeurPropose & { actif?: boolean };

/** Types proposés, regroupés par type de véhicule ; un type désactivé reste visible s'il est déjà choisi. */
function groupesDeTypes(types: TypePropose[], actuelId?: number | null) {
  const groupes = new Map<string, TypePropose[]>();
  for (const t of types) {
    if (t.actif === false && Number(t.id) !== Number(actuelId)) continue;
    groupes.set(t.type_vehicule_nom, [...(groupes.get(t.type_vehicule_nom) ?? []), t]);
  }
  return [...groupes.entries()];
}

type Props = {
  /** `null` : création d'un nouveau chauffeur. */
  chauffeur: Chauffeur | null;
  /**
   * `mairie` (par défaut) : tous les champs, compte d'accès et propriétaire.
   * `proprietaire` : le propriétaire connecté ajoute ou modifie un de ses chauffeurs.
   */
  espace?: "mairie" | "proprietaire";
  /** Ouvre la modification avec la création du compte déjà cochée. */
  avecCompte?: boolean;
  onClose: () => void;
  /** Appelé après l'enregistrement (fiche et photo). */
  onSaved?: (fiche: Chauffeur) => void;
};

/**
 * Formulaire de création / modification d'un chauffeur.
 * À monter seulement quand il est ouvert : son état part des props.
 */
export default function ChauffeurFormModal({
  chauffeur: editing,
  espace = "mairie",
  avecCompte = false,
  onClose,
  onSaved,
}: Props) {
  const mairie = espace === "mairie";
  const store = mairie ? useChauffeursStore : useMesChauffeursStore;
  const chemin = mairie ? "/chauffeurs" : "/chauffeurs/mes-chauffeurs";
  const user = useAuthStore((s) => s.user);
  const voitProprietaires = mairie && peutVoir(user, "proprietaires");
  const typesMairie = useTypesChauffeursStore((s) => s.items);
  const [typesProprietaire, setTypesProprietaire] = useState<TypePropose[]>([]);
  const proprietaires = useProprietairesStore((s) => s.items);
  const [creerCompte, setCreerCompte] = useState(avecCompte);
  const [motDePasse, setMotDePasse] = useState(genererMotDePasse);
  const [photo, setPhoto] = useState<File | null>(null);
  const [prochain, setProchain] = useState<string | null>(null);
  const enregistrement = useAction();

  useEffect(() => {
    if (!mairie) {
      // Le propriétaire n'a pas accès au paramétrage : route dédiée aux types actifs
      api<TypePropose[]>("/chauffeurs/mes-chauffeurs/types")
        .then(setTypesProprietaire)
        .catch(() => setTypesProprietaire([]));
      return;
    }
    useTypesChauffeursStore.getState().fetchAll();
    if (voitProprietaires) useProprietairesStore.getState().fetchAll();
  }, [mairie, voitProprietaires]);

  // Aperçu seulement : l'API attribue l'identifiant à l'enregistrement
  // (route ouverte à tout compte connecté, propriétaire compris)
  useEffect(() => {
    if (editing) return;
    api<{ identifiant: string }>("/parametres-indentifiants/prochain/chauffeur")
      .then((r) => setProchain(r.identifiant))
      .catch(() => setProchain(null));
  }, [editing]);

  const types: TypePropose[] = mairie ? typesMairie : typesProprietaire;
  const groupes = groupesDeTypes(types, editing?.type_chauffeur_id);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const compteACreer = mairie && creerCompte && !editing?.user_id;
    const body = corpsDuFormulaire(e.currentTarget, compteACreer);
    const { create, update, fetchAll } = store.getState();
    let enregistree: Chauffeur | null = null;
    const ok = await enregistrement.run(
      async () => {
        enregistree = editing ? await update(editing.id, body) : await create(body);
        // La photo part après la fiche : sa route a besoin de l'id et de l'identifiant
        if (photo) {
          const envoi = new FormData();
          envoi.append("photo", photo);
          enregistree = await api<Chauffeur>(`${chemin}/${enregistree.id}/photo`, "POST", envoi);
          await fetchAll({ force: true });
        }
      },
      compteACreer
        ? `Chauffeur enregistré, compte actif pour ${body.email}`
        : editing
          ? "Chauffeur modifié"
          : "Chauffeur enregistré",
    );
    if (ok && enregistree) {
      onSaved?.(enregistree);
      onClose();
    }
  }

  return (
    <FormModal
      size="lg"
      open
      title={editing ? "Modifier le chauffeur" : "Nouveau chauffeur"}
      subtitle={
        editing
          ? nomChauffeur(editing)
          : mairie
            ? "Les champs marqués * sont obligatoires."
            : "La mairie vérifiera la fiche avant de la valider."
      }
      onClose={onClose}
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
        <Field label="Type de chauffeur *">
          {/* La clé remonte la liste quand les types arrivent, pour garder la valeur choisie */}
          <select
            key={types.length}
            name="type_chauffeur_id"
            required
            defaultValue={editing?.type_chauffeur_id ?? ""}
            className="input-field"
          >
            <option value="" disabled>
              {types.length ? "Choisir…" : "Aucun type de chauffeur"}
            </option>
            {groupes.map(([vehicule, liste]) => (
              <optgroup key={vehicule} label={vehicule}>
                {liste.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nom}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>
        <Field label="Date de naissance">
          <DatePicker name="date_naissance" defaultValue={editing?.date_naissance} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Lieu de naissance">
            <input
              name="lieu_naissance"
              defaultValue={editing?.lieu_naissance ?? ""}
              className="input-field"
            />
          </Field>
        </div>
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

      <FormSection title="Contact" icon={Contact}>
        <Field label="Téléphone *">
          <TelephoneInput name="telephone" required defaultValue={editing?.telephone} />
        </Field>
        <Field label={mairie && creerCompte && !editing?.user_id ? "Email *" : "Email"}>
          <input
            name="email"
            type="email"
            required={mairie && creerCompte && !editing?.user_id}
            defaultValue={editing?.email ?? ""}
            className="input-field"
          />
        </Field>
        <div className="sm:col-span-2">
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

      {voitProprietaires && (
        <FormSection title="Propriétaire" icon={Briefcase} columns={1}>
          <Field label="Employé par">
            {/* La clé remonte la liste quand les propriétaires arrivent */}
            <select
              key={proprietaires.length}
              name="proprietaire_id"
              defaultValue={editing?.proprietaire_id ?? ""}
              className="input-field"
            >
              <option value="">Aucun propriétaire</option>
              {proprietaires.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.prenom} {p.nom.toUpperCase()} · {p.identifiant}
                </option>
              ))}
            </select>
          </Field>
        </FormSection>
      )}

      {mairie && (
        <FormSection title="Espace chauffeur" icon={KeyRound} columns={1}>
          {editing?.user_id ? (
            <p className="alert-info flex items-center gap-2">
              <CircleCheck className="size-4 shrink-0" />
              Compte déjà créé : le chauffeur se connecte avec{" "}
              <strong>{editing.compte_email ?? editing.email}</strong>.
            </p>
          ) : (
            <>
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={creerCompte}
                  onChange={(e) => setCreerCompte(e.target.checked)}
                  className="size-4 accent-primary"
                />
                <span className="font-medium">
                  Créer son compte d&apos;accès (actif tout de suite)
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
                    À transmettre au chauffeur : il ne sera plus affiché.
                  </p>
                </div>
              )}
            </>
          )}
        </FormSection>
      )}

      <FormSection title="Notes" icon={NotebookPen} columns={1}>
        <textarea
          name="notes"
          rows={3}
          defaultValue={editing?.notes ?? ""}
          placeholder="Informations utiles pour la mairie"
          aria-label="Notes"
          className="input-field"
        />
      </FormSection>
    </FormModal>
  );
}
