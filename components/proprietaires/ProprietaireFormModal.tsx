"use client";

import { useEffect, useState } from "react";
import {
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
import { useAction } from "@/lib/useAction";
import type { Proprietaire } from "@/types";
import { useProprietairesStore } from "@/stores";

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

type Props = {
  /** `null` : création d'un nouveau propriétaire. */
  proprietaire: Proprietaire | null;
  /** Ouvre la modification avec la création du compte déjà cochée. */
  avecCompte?: boolean;
  onClose: () => void;
  /** Appelé après l'enregistrement (fiche et photo). */
  onSaved?: (fiche: Proprietaire) => void;
};

/**
 * Formulaire de création / modification d'un propriétaire.
 * À monter seulement quand il est ouvert : son état part des props.
 */
export default function ProprietaireFormModal({
  proprietaire: editing,
  avecCompte = false,
  onClose,
  onSaved,
}: Props) {
  const proprietaires = useProprietairesStore();
  // À la création, le compte est proposé par défaut ; en modification, à la demande
  const [creerCompte, setCreerCompte] = useState(!editing || avecCompte);
  const [motDePasse, setMotDePasse] = useState(genererMotDePasse);
  const [photo, setPhoto] = useState<File | null>(null);
  const [prochain, setProchain] = useState<string | null>(null);
  const enregistrement = useAction();

  // Aperçu seulement : l'API attribue l'identifiant à l'enregistrement
  useEffect(() => {
    if (editing) return;
    api<{ identifiant: string }>("/parametres-indentifiants/prochain/proprietaire")
      .then((r) => setProchain(r.identifiant))
      .catch(() => setProchain(null));
  }, [editing]);

  const nomDe = (p: Proprietaire) => `${p.prenom} ${p.nom.toUpperCase()}`;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const compteACreer = creerCompte && !editing?.user_id;
    const body = corpsDuFormulaire(e.currentTarget, compteACreer);
    let enregistree: Proprietaire | null = null;
    const ok = await enregistrement.run(
      async () => {
        enregistree = editing
          ? await proprietaires.update(editing.id, body)
          : await proprietaires.create(body);
        // La photo part après la fiche : sa route a besoin de l'id et de l'identifiant
        if (photo) {
          const envoi = new FormData();
          envoi.append("photo", photo);
          enregistree = await api<Proprietaire>(
            `/proprietaires/${enregistree.id}/photo`,
            "POST",
            envoi,
          );
          await proprietaires.fetchAll({ force: true });
        }
      },
      compteACreer
        ? `Propriétaire enregistré, compte actif pour ${body.email}`
        : editing
          ? "Propriétaire modifié"
          : "Propriétaire enregistré",
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
      title={editing ? "Modifier le propriétaire" : "Nouveau propriétaire"}
      subtitle={editing ? nomDe(editing) : "Les champs marqués * sont obligatoires."}
      onClose={onClose}
      onSubmit={onSubmit}
      submitLabel={editing ? "Enregistrer" : "Créer"}
      pending={enregistrement.pending}
      formKey={editing?.id ?? "nouveau"}
    >
      <PhotoInput actuelle={fichierUrl(editing?.photo_chemin)} fichier={photo} onChange={setPhoto} />

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
          <input name="profession" defaultValue={editing?.profession ?? ""} className="input-field" />
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
          <TelephoneInput name="telephone_secondaire" defaultValue={editing?.telephone_secondaire} />
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
                  passe. Le compte est actif tout de suite, puisque la mairie a vérifié ses pièces.
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
  );
}
