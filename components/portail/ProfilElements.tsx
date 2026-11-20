"use client";

import type { ReactNode } from "react";
import {
  CalendarDays,
  Camera,
  Circle,
  CircleCheck,
  Hash,
  Pencil,
  type LucideIcon,
} from "lucide-react";
import { Avatar, type Tone } from "@/components/ui";
import { formatDate } from "@/lib/api";

/** Éléments communs aux pages « Mon profil » (propriétaire, chauffeur). */

export const COULEURS_STATUT: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  warning: "bg-accent/20 text-text-main",
  success: "bg-secondary/15 text-secondary",
  muted: "bg-text-muted/15 text-text-muted",
  danger: "bg-danger/10 text-danger",
};

/** Champs que l'utilisateur complète lui-même : base du pourcentage. */
export type ChampACompleter<T> = { champ: keyof T; label: string };

export function completionDe<T>(fiche: T, champs: ChampACompleter<T>[]) {
  const manquants = champs.filter(({ champ }) => !fiche[champ]);
  const pct = Math.round(((champs.length - manquants.length) / champs.length) * 100);
  return { manquants, pct };
}

type LigneProps = {
  label: string;
  valeur?: ReactNode;
  icon: LucideIcon;
  /** Champ que la mairie gère : pas de lien « À compléter ». */
  verrouille?: boolean;
  onCompleter?: () => void;
};

export function Ligne({ label, valeur, icon: Icon, verrouille, onCompleter }: LigneProps) {
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

export function CarteProfil({
  titre,
  icon: Icon,
  children,
}: {
  titre: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section className="card p-0">
      <h3 className="flex items-center gap-2 border-b border-border px-6 py-4 font-bold">
        <Icon className="size-5 text-primary" />
        {titre}
      </h3>
      <dl className="grid gap-x-8 px-6 py-2 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

/** Anneau de progression du profil. */
export function Anneau({ pct }: { pct: number }) {
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

/** En-tête du profil : bandeau, photo, nom, identifiant, statut et action principale. */
export function EnteteProfil({
  nom,
  photo,
  identifiant,
  statut,
  date,
  dateLabel,
  aCompleter,
  onModifier,
  extra,
}: {
  nom: string;
  photo: string | null;
  identifiant: string;
  statut: { label: string; tone: Tone; icon: LucideIcon };
  date: string;
  /** « Inscrit le », « Enregistré le »… */
  dateLabel: string;
  aCompleter: boolean;
  onModifier: () => void;
  /** Badges supplémentaires (type de chauffeur…). */
  extra?: ReactNode;
}) {
  const IconeStatut = statut.icon;
  return (
    <section className="card overflow-hidden p-0">
      <div className="relative h-28 bg-primary sm:h-32">
        {/* Motif discret sur le bandeau */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-size-[18px_18px] opacity-10"
        />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-accent" />
      </div>

      <div className="flex flex-col gap-5 px-6 pb-6 sm:flex-row sm:items-end sm:gap-6">
        <div className="relative -mt-14 self-center sm:-mt-12 sm:self-auto">
          <Avatar
            label={nom}
            photo={photo}
            className="size-28 border-4 border-surface bg-primary/5 text-3xl shadow-md"
          />
          <button
            type="button"
            onClick={onModifier}
            aria-label="Changer ma photo"
            title="Changer ma photo"
            className="absolute bottom-1 right-1 flex size-8 items-center justify-center rounded-full border-2 border-surface bg-accent text-on-accent shadow transition-transform hover:scale-105"
          >
            <Camera className="size-4" />
          </button>
        </div>

        <div className="min-w-0 flex-1 text-center sm:pb-1 sm:text-left">
          <h2 className="break-words text-2xl font-bold">{nom}</h2>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary">
              <Hash className="size-3.5" />
              {identifiant}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${COULEURS_STATUT[statut.tone]}`}
            >
              <IconeStatut className="size-3.5" />
              {statut.label}
            </span>
            {extra}
            <span className="inline-flex items-center gap-1.5 px-1 text-xs text-text-muted">
              <CalendarDays className="size-3.5" />
              {dateLabel} {formatDate(date)}
            </span>
          </div>
        </div>

        <button
          onClick={onModifier}
          className="btn-primary inline-flex shrink-0 items-center justify-center gap-2 sm:mb-1"
        >
          <Pencil className="size-4" />
          {aCompleter ? "Compléter mon profil" : "Modifier mon profil"}
        </button>
      </div>
    </section>
  );
}

/** Avancement du profil : anneau, liste des informations, bouton pour compléter. */
export function CarteCompletion<T>({
  champs,
  manquants,
  pct,
  onCompleter,
}: {
  champs: ChampACompleter<T>[];
  manquants: ChampACompleter<T>[];
  pct: number;
  onCompleter: () => void;
}) {
  return (
    <section className="card">
      <div className="flex items-center gap-5">
        <Anneau pct={pct} />
        <div>
          <h3 className="font-bold">{pct === 100 ? "Profil complet" : "Complétez votre profil"}</h3>
          <p className="mt-1 text-sm text-text-muted">
            {manquants.length === 0
              ? "Toutes vos informations sont renseignées."
              : `${manquants.length} information${manquants.length > 1 ? "s" : ""} à ajouter. Un profil complet accélère la validation.`}
          </p>
        </div>
      </div>

      <ul className="mt-6 space-y-2.5 border-t border-border pt-5">
        {champs.map(({ champ, label }) => {
          const fait = !manquants.some((m) => m.champ === champ);
          const Icon = fait ? CircleCheck : Circle;
          return (
            <li key={String(champ)} className="flex items-center gap-3 text-sm">
              <Icon className={`size-4 shrink-0 ${fait ? "text-secondary" : "text-border"}`} />
              <span className={fait ? "text-text-main" : "text-text-muted"}>{label}</span>
            </li>
          );
        })}
      </ul>

      {manquants.length > 0 && (
        <button
          onClick={onCompleter}
          className="btn-ghost mt-6 inline-flex w-full items-center justify-center gap-2"
        >
          <Pencil className="size-4" />
          Compléter maintenant
        </button>
      )}
    </section>
  );
}

/** Chiffre du tableau de bord ; `enAvant` : tuile pleine (statut du dossier). */
export function Stat({
  label,
  valeur,
  icon: Icon,
  aide,
  enAvant,
}: {
  label: string;
  valeur: string;
  icon: LucideIcon;
  aide?: string;
  enAvant?: boolean;
}) {
  return (
    <div
      className={`tuile-mobile flex items-center gap-4 rounded-lg border p-6 ${
        enAvant ? "border-primary bg-primary text-white" : "border-border bg-surface"
      }`}
    >
      <span
        className={`flex size-14 shrink-0 items-center justify-center rounded-full ${
          enAvant ? "bg-white/15 text-accent" : "bg-primary/10 text-primary"
        }`}
      >
        <Icon className="size-6" />
      </span>
      <div className="min-w-0">
        <p className={`text-sm ${enAvant ? "text-white/70" : "text-text-muted"}`}>{label}</p>
        <p className="mt-1 truncate text-2xl font-bold">{valeur}</p>
        {aide && (
          <p className={`text-xs ${enAvant ? "text-white/60" : "text-text-muted"}`}>{aide}</p>
        )}
      </div>
    </div>
  );
}

/** Étape du dossier (inscription, profil complet, validation). */
export function Etape({ fait, titre, texte }: { fait: boolean; titre: string; texte: string }) {
  const Icon = fait ? CircleCheck : Circle;
  return (
    <li className="flex gap-4">
      <Icon className={`mt-0.5 size-6 shrink-0 ${fait ? "text-secondary" : "text-border"}`} />
      <div>
        <p className={`font-semibold ${fait ? "text-text-main" : "text-text-muted"}`}>{titre}</p>
        <p className="text-sm text-text-muted">{texte}</p>
      </div>
    </li>
  );
}

/** Barre d'avancement du profil, avec le nombre d'informations manquantes. */
export function BarreCompletion({ pct, manquants }: { pct: number; manquants: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">Profil complété à {pct} %</span>
        <span className="text-text-muted">
          {manquants === 0
            ? "Complet"
            : `${manquants} information${manquants > 1 ? "s" : ""} à ajouter`}
        </span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-background">
        <div
          className={`h-full rounded-full ${pct === 100 ? "bg-secondary" : "bg-accent"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** Statut du dossier et ce qu'il signifie. */
export function CarteStatut({
  titre = "Statut du dossier",
  statut,
  explication,
}: {
  titre?: string;
  statut: { label: string; tone: Tone; icon: LucideIcon };
  explication: string;
}) {
  const Icon = statut.icon;
  return (
    <section className="card">
      <p className="text-sm text-text-muted">{titre}</p>
      <p className="mt-2 flex items-center gap-2 text-lg font-bold">
        <span
          className={`flex size-9 items-center justify-center rounded-full ${COULEURS_STATUT[statut.tone]}`}
        >
          <Icon className="size-5" />
        </span>
        {statut.label}
      </p>
      <p className="mt-3 text-sm text-text-muted">{explication}</p>
    </section>
  );
}
