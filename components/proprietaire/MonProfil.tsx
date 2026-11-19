"use client";

import { useState } from "react";
import {
  Ban,
  Briefcase,
  CalendarDays,
  Camera,
  CircleCheck,
  CircleMinus,
  CircleX,
  Circle,
  Clock,
  FileWarning,
  Hash,
  IdCard,
  Info,
  Mail,
  MapPin,
  Pencil,
  Phone,
  PhoneCall,
  UserRound,
  VenusAndMars,
  type LucideIcon,
} from "lucide-react";
import DatePicker from "@/components/DatePicker";
import { CinInput, TelephoneInput } from "@/components/FormatInput";
import FormModal, { FormSection } from "@/components/FormModal";
import PhotoInput from "@/components/PhotoInput";
import Skeleton from "@/components/Skeleton";
import { Avatar, Field } from "@/components/ui";
import { fichierUrl, formatDate } from "@/lib/api";
import { afficherTelephone, formaterCin } from "@/lib/formats";
import { A_COMPLETER, completion } from "@/lib/maFiche";
import { useAction } from "@/lib/useAction";
import { STATUTS_FICHE, type StatutFiche } from "@/types";
import { useMaFicheStore } from "@/stores";

const CHAMPS_ENVOYES = [
  "cin",
  "date_naissance",
  "lieu_naissance",
  "sexe",
  "profession",
  "telephone_principal",
  "telephone_secondaire",
  "adresse",
];

/** Ce que chaque statut signifie pour le propriétaire. */
const EXPLICATIONS: Record<StatutFiche, { icon: LucideIcon; texte: string }> = {
  en_verification: {
    icon: Clock,
    texte: "La mairie vérifie vos informations et vos pièces. Vous serez informé du résultat.",
  },
  dossier_incomplet: {
    icon: FileWarning,
    texte: "Il manque des informations ou des pièces. Complétez votre profil ou passez à la mairie.",
  },
  actif: {
    icon: CircleCheck,
    texte: "Votre dossier a été vérifié et validé par la mairie.",
  },
  suspendu: {
    icon: Ban,
    texte: "Votre dossier est suspendu. Rapprochez-vous de la mairie pour en connaître la raison.",
  },
  inactif: {
    icon: CircleMinus,
    texte: "Votre dossier n'est plus actif. Contactez la mairie pour le réactiver.",
  },
  radie: {
    icon: CircleX,
    texte: "Votre dossier a été radié. Contactez la mairie pour plus d'informations.",
  },
};

const COULEURS_STATUT = {
  warning: "bg-accent/20 text-text-main",
  success: "bg-secondary/15 text-secondary",
  muted: "bg-text-muted/15 text-text-muted",
  danger: "bg-danger/10 text-danger",
};

type LigneProps = {
  label: string;
  valeur?: string | null;
  icon: LucideIcon;
  /** Champ que la mairie gère : pas de lien « À compléter ». */
  verrouille?: boolean;
  onCompleter?: () => void;
};

function Ligne({ label, valeur, icon: Icon, verrouille, onCompleter }: LigneProps) {
  return (
    <div className="flex min-w-0 items-start gap-3 py-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs text-text-muted">{label}</dt>
        <dd className="mt-0.5 break-words text-sm font-semibold text-text-main">
          {valeur ? (
            valeur
          ) : verrouille ? (
            <span className="font-normal text-text-muted">Non renseigné</span>
          ) : (
            <button
              type="button"
              onClick={onCompleter}
              className="font-medium text-text-main underline decoration-accent decoration-2 underline-offset-4 hover:text-primary"
            >
              À compléter
            </button>
          )}
        </dd>
      </div>
    </div>
  );
}

function Carte({
  titre,
  icon: Icon,
  children,
}: {
  titre: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg bg-surface shadow-sm">
      <h3 className="flex items-center gap-2 border-b border-border px-6 py-4 font-bold">
        <Icon className="size-5 text-primary" />
        {titre}
      </h3>
      <dl className="grid gap-x-8 px-6 py-2 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

/** Anneau de progression du profil. */
function Anneau({ pct }: { pct: number }) {
  const r = 34;
  const tour = 2 * Math.PI * r;
  return (
    <div className="relative size-24 shrink-0">
      <svg viewBox="0 0 80 80" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="7" className="stroke-background" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={tour}
          strokeDashoffset={tour * (1 - pct / 100)}
          className={`transition-[stroke-dashoffset] duration-700 ${
            pct === 100 ? "stroke-secondary" : "stroke-accent"
          }`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">
        {pct}%
      </span>
    </div>
  );
}

/** Fiche du propriétaire connecté : panel de présentation, consultation, modification. */
export default function MonProfil() {
  const { fiche, error: erreur, modifier, envoyerPhoto } = useMaFicheStore();
  const [formOpen, setFormOpen] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const enregistrement = useAction();

  if (erreur) return <p className="alert-error">{erreur}</p>;
  if (!fiche) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-56 w-full" />
        <div className="grid gap-6 xl:grid-cols-3">
          <Skeleton className="h-80 xl:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const { manquants, pct } = completion(fiche);
  const cleStatut = fiche.statut ?? "en_verification";
  const statut = STATUTS_FICHE[cleStatut];
  const { icon: IconeStatut, texte: explication } = EXPLICATIONS[cleStatut];
  const nom = `${fiche.prenom} ${fiche.nom.toUpperCase()}`;
  const photoUrl = fichierUrl(fiche.photo_chemin);

  function ouvrir() {
    setPhoto(null);
    setFormOpen(true);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const saisie = new FormData(e.currentTarget);
    const body: Record<string, string> = {};
    for (const champ of CHAMPS_ENVOYES) {
      const v = String(saisie.get(champ) ?? "").trim();
      // Date et sexe sont validés par format : omis s'ils sont vides
      if (v || !["date_naissance", "sexe"].includes(champ)) body[champ] = v;
    }
    const ok = await enregistrement.run(async () => {
      await modifier(body);
      if (photo) await envoyerPhoto(photo);
    }, "Votre profil a été mis à jour");
    if (ok) setFormOpen(false);
  }

  return (
    <div className="space-y-6">
      {/* En-tête : bandeau, photo, nom, statut et action principale */}
      <section className="overflow-hidden rounded-lg bg-surface shadow-sm">
        <div className="relative h-28 bg-primary sm:h-32">
          {/* Motif discret sur le bandeau */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-size-[18px_18px]"
          />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-accent" />
        </div>

        <div className="flex flex-col gap-5 px-6 pb-6 sm:flex-row sm:items-end sm:gap-6">
          <div className="relative -mt-14 self-center sm:-mt-12 sm:self-auto">
            <Avatar
              label={nom}
              photo={photoUrl}
              className="size-28 border-4 border-surface bg-primary/5 text-3xl shadow-md"
            />
            <button
              type="button"
              onClick={ouvrir}
              aria-label="Changer ma photo"
              title="Changer ma photo"
              className="absolute bottom-1 right-1 flex size-8 items-center justify-center rounded-full border-2 border-surface bg-accent text-text-main shadow transition-transform hover:scale-105"
            >
              <Camera className="size-4" />
            </button>
          </div>

          <div className="min-w-0 flex-1 text-center sm:pb-1 sm:text-left">
            <h2 className="break-words text-2xl font-bold">{nom}</h2>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary">
                <Hash className="size-3.5" />
                {fiche.identifiant}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${COULEURS_STATUT[statut.tone]}`}
              >
                <IconeStatut className="size-3.5" />
                {statut.label}
              </span>
              <span className="inline-flex items-center gap-1.5 px-1 text-xs text-text-muted">
                <CalendarDays className="size-3.5" />
                Inscrit le {formatDate(fiche.created_at)}
              </span>
            </div>
          </div>

          <button
            onClick={ouvrir}
            className="btn-primary inline-flex shrink-0 items-center justify-center gap-2 sm:mb-1"
          >
            <Pencil className="size-4" />
            {manquants.length ? "Compléter mon profil" : "Modifier mon profil"}
          </button>
        </div>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-3">
        {/* Informations déclarées */}
        <div className="space-y-6 xl:col-span-2">
          <Carte titre="Identité" icon={UserRound}>
            <Ligne label="Nom" valeur={fiche.nom.toUpperCase()} icon={UserRound} verrouille />
            <Ligne label="Prénom" valeur={fiche.prenom} icon={UserRound} verrouille />
            <Ligne label="CIN" valeur={formaterCin(fiche.cin)} icon={IdCard} onCompleter={ouvrir} />
            <Ligne
              label="Sexe"
              valeur={fiche.sexe === "M" ? "Masculin" : fiche.sexe === "F" ? "Féminin" : null}
              icon={VenusAndMars}
              onCompleter={ouvrir}
            />
            <Ligne
              label="Date de naissance"
              valeur={fiche.date_naissance ? formatDate(fiche.date_naissance) : null}
              icon={CalendarDays}
              onCompleter={ouvrir}
            />
            <Ligne
              label="Lieu de naissance"
              valeur={fiche.lieu_naissance}
              icon={MapPin}
              onCompleter={ouvrir}
            />
            <Ligne
              label="Profession"
              valeur={fiche.profession}
              icon={Briefcase}
              onCompleter={ouvrir}
            />
          </Carte>

          <Carte titre="Coordonnées" icon={Phone}>
            <Ligne
              label="Téléphone principal"
              valeur={afficherTelephone(fiche.telephone_principal)}
              icon={Phone}
              onCompleter={ouvrir}
            />
            <Ligne
              label="Téléphone secondaire"
              valeur={afficherTelephone(fiche.telephone_secondaire)}
              icon={PhoneCall}
              onCompleter={ouvrir}
            />
            <Ligne label="Email" valeur={fiche.email} icon={Mail} verrouille />
            <Ligne label="Adresse" valeur={fiche.adresse} icon={MapPin} onCompleter={ouvrir} />
          </Carte>
        </div>

        <aside className="space-y-6">
          {/* Avancement du profil */}
          <section className="rounded-lg bg-surface p-6 shadow-sm">
            <div className="flex items-center gap-5">
              <Anneau pct={pct} />
              <div>
                <h3 className="font-bold">
                  {pct === 100 ? "Profil complet" : "Complétez votre profil"}
                </h3>
                <p className="mt-1 text-sm text-text-muted">
                  {manquants.length === 0
                    ? "Toutes vos informations sont renseignées."
                    : `${manquants.length} information${manquants.length > 1 ? "s" : ""} à ajouter. Un profil complet accélère la validation.`}
                </p>
              </div>
            </div>

            <ul className="mt-6 space-y-2.5 border-t border-border pt-5">
              {A_COMPLETER.map(({ champ, label }) => {
                const fait = !manquants.some((m) => m.champ === champ);
                const Icon = fait ? CircleCheck : Circle;
                return (
                  <li key={champ} className="flex items-center gap-3 text-sm">
                    <Icon
                      className={`size-4 shrink-0 ${fait ? "text-secondary" : "text-border"}`}
                    />
                    <span className={fait ? "text-text-main" : "text-text-muted"}>{label}</span>
                  </li>
                );
              })}
            </ul>

            {manquants.length > 0 && (
              <button
                onClick={ouvrir}
                className="btn-ghost mt-6 inline-flex w-full items-center justify-center gap-2"
              >
                <Pencil className="size-4" />
                Compléter maintenant
              </button>
            )}
          </section>

          {/* Statut du dossier */}
          <section className="rounded-lg bg-surface p-6 shadow-sm">
            <p className="text-sm text-text-muted">Statut du dossier</p>
            <p className="mt-2 flex items-center gap-2 text-lg font-bold">
              <span
                className={`flex size-9 items-center justify-center rounded-full ${COULEURS_STATUT[statut.tone]}`}
              >
                <IconeStatut className="size-5" />
              </span>
              {statut.label}
            </p>
            <p className="mt-3 text-sm text-text-muted">{explication}</p>
          </section>

          <p className="flex items-start gap-2 px-1 text-xs text-text-muted">
            <Info className="mt-0.5 size-4 shrink-0" />
            Nom, prénom et email sont gérés par la mairie. Pour les corriger, présentez-vous avec
            votre CIN.
          </p>
        </aside>
      </div>

      <FormModal
        open={formOpen}
        centrage="ecran"
        size="lg"
        title="Mon profil"
        subtitle="Nom, prénom et email sont gérés par la mairie."
        onClose={() => setFormOpen(false)}
        onSubmit={onSubmit}
        submitLabel="Enregistrer"
        pending={enregistrement.pending}
        formKey={fiche.id}
      >
        <PhotoInput actuelle={fichierUrl(fiche.photo_chemin)} fichier={photo} onChange={setPhoto} />

        <FormSection columns={3} title="Identité" icon={UserRound}>
          <Field label="CIN">
            <CinInput name="cin" defaultValue={fiche.cin} />
          </Field>
          <Field label="Date de naissance">
            <DatePicker name="date_naissance" defaultValue={fiche.date_naissance} />
          </Field>
          <Field label="Lieu de naissance">
            <input
              name="lieu_naissance"
              defaultValue={fiche.lieu_naissance ?? ""}
              className="input-field"
            />
          </Field>
          <Field label="Sexe">
            <select name="sexe" defaultValue={fiche.sexe ?? ""} className="input-field">
              <option value="">Non précisé</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </Field>
          <Field label="Profession">
            <input
              name="profession"
              defaultValue={fiche.profession ?? ""}
              className="input-field"
            />
          </Field>
        </FormSection>

        <FormSection columns={2} title="Contact" icon={IdCard}>
          <Field label="Téléphone *">
            <TelephoneInput
              name="telephone_principal"
              required
              defaultValue={fiche.telephone_principal}
            />
          </Field>
          <Field label="Téléphone secondaire">
            <TelephoneInput name="telephone_secondaire" defaultValue={fiche.telephone_secondaire} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Adresse">
              <input
                name="adresse"
                defaultValue={fiche.adresse ?? ""}
                placeholder="Lot, quartier, fokontany"
                className="input-field"
              />
            </Field>
          </div>
        </FormSection>

        <p className="flex items-start gap-2 text-xs text-text-muted">
          <IdCard className="mt-0.5 size-4 shrink-0" />
          Pour corriger votre nom, prénom ou email, adressez-vous à la mairie avec votre CIN.
        </p>
      </FormModal>
    </div>
  );
}
