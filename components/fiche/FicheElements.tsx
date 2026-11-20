"use client";

import type { ReactNode } from "react";
import { ArrowRight, History, type LucideIcon } from "lucide-react";
import Skeleton from "@/components/Skeleton";
import type { Tone } from "@/components/ui";
import { formatDateTime, formatRelative } from "@/lib/api";

/** Éléments communs aux fiches détaillées (propriétaire, chauffeur…). */

const COULEURS: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  warning: "bg-accent/20 text-text-main",
  success: "bg-secondary/15 text-secondary",
  muted: "bg-text-muted/15 text-text-muted",
  danger: "bg-danger/10 text-danger",
};

const POINTS: Record<Tone, string> = {
  primary: "bg-primary",
  warning: "bg-accent",
  success: "bg-secondary",
  muted: "bg-text-muted",
  danger: "bg-danger",
};

/** Badge coloré : statut d'une fiche, liste noire… */
export function BadgeTon({
  label,
  tone,
  icon: Icon,
}: {
  label: string;
  tone: Tone;
  icon?: LucideIcon;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${COULEURS[tone]}`}
    >
      {Icon && <Icon className="size-3.5" />}
      {label}
    </span>
  );
}

export function Carte({
  titre,
  icon: Icon,
  sousTitre,
  action,
  children,
  className = "",
}: {
  titre: string;
  icon: LucideIcon;
  sousTitre?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card overflow-hidden p-0 ${className}`}>
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <div>
          <h2 className="flex items-center gap-2 font-bold">
            <Icon className="size-5 text-primary" />
            {titre}
          </h2>
          {sousTitre && <p className="mt-0.5 text-sm text-text-muted">{sousTitre}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Info({
  label,
  valeur,
  icon: Icon,
}: {
  label: string;
  valeur?: ReactNode;
  icon: LucideIcon;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-text-muted" />
      <div className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-wider text-text-muted">{label}</dt>
        <dd className="mt-1 break-words text-sm font-semibold text-text-main">
          {valeur || <span className="font-normal text-text-muted">—</span>}
        </dd>
      </div>
    </div>
  );
}

/** Case du résumé sous l'en-tête de la fiche. */
export function Resume({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-text-muted">{label}</dt>
      <dd className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">{children}</dd>
    </div>
  );
}

export function FicheSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-44 w-full" />
      <Skeleton className="h-11 w-80" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

export type OngletFiche<K extends string> = {
  key: K;
  label: string;
  icon: LucideIcon;
  count?: number;
  /** Section pas encore disponible : onglet grisé. */
  bientot?: boolean;
};

/** Onglets soulignés de la fiche. */
export function OngletsFiche<K extends string>({
  onglets,
  value,
  onChange,
}: {
  onglets: OngletFiche<K>[];
  value: K;
  onChange: (key: K) => void;
}) {
  return (
    // Ligne du bas en ombre intérieure : le soulignement de l'onglet actif passe dessus
    // sans déborder (sinon overflow-x-auto fait apparaître un défilement vertical)
    <nav
      className="flex gap-1 overflow-x-auto overflow-y-hidden shadow-[inset_0_-1px_0_var(--color-border)]"
      role="tablist"
    >
      {onglets.map(({ key, label, icon: Icon, count, bientot }) => {
        const actif = key === value;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={actif}
            disabled={bientot}
            title={bientot ? "Bientôt disponible" : undefined}
            onClick={() => onChange(key)}
            className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              actif
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text-main"
            }`}
          >
            <Icon className="size-4" />
            {label}
            {count !== undefined && (
              <span
                className={`min-w-6 rounded-sm px-1.5 py-0.5 text-center text-xs font-bold ${
                  actif ? "bg-primary/10 text-primary" : "bg-border text-text-muted"
                }`}
              >
                {count}
              </span>
            )}
            {bientot && (
              <span className="rounded-sm bg-background px-1.5 py-0.5 text-[10px] uppercase">
                Bientôt
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

/** Ligne d'historique des statuts (`GET /<ressource>/:id/historique`). */
export type LigneHistorique<S extends string> = {
  id: number;
  ancien_statut: S | null;
  nouveau_statut: S;
  justification: string;
  modifie_par_nom: string | null;
  created_at: string;
};

/** Frise des changements de statut, du plus récent au plus ancien. */
export function HistoriqueStatuts<S extends string>({
  historique,
  erreur,
  badge,
  tonDe,
  vide,
}: {
  historique: LigneHistorique<S>[] | null;
  erreur?: string;
  badge: (statut: S) => ReactNode;
  tonDe: (statut: S) => Tone;
  /** Phrase affichée quand il n'y a encore aucun changement. */
  vide: string;
}) {
  return (
    <Carte
      titre="Historique des statuts"
      icon={History}
      sousTitre={
        historique
          ? `${historique.length} changement${historique.length > 1 ? "s" : ""}`
          : undefined
      }
    >
      {erreur ? (
        <p className="alert-error m-6">{erreur}</p>
      ) : !historique ? (
        <div className="space-y-4 p-6">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : historique.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-12 text-center text-text-muted">
          <History className="size-8" />
          <p className="font-semibold text-text-main">Aucun changement de statut.</p>
          <p className="text-sm">{vide}</p>
        </div>
      ) : (
        <ol className="p-6">
          {historique.map((h, i) => (
            <li key={h.id} className="relative flex gap-4 pb-8 last:pb-0">
              {/* Trait vertical qui relie les événements */}
              {i < historique.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[7px] top-5 h-full w-0.5 bg-border"
                />
              )}
              <span
                className={`relative mt-1 size-4 shrink-0 rounded-full ring-4 ring-surface ${
                  POINTS[tonDe(h.nouveau_statut)]
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {h.ancien_statut && (
                    <>
                      {badge(h.ancien_statut)}
                      <ArrowRight className="size-4 text-text-muted" />
                    </>
                  )}
                  {badge(h.nouveau_statut)}
                </div>
                <p className="mt-2 whitespace-pre-line rounded-md border-l-4 border-border bg-background px-3 py-2 text-sm">
                  {h.justification}
                </p>
                <p className="mt-2 text-xs text-text-muted">
                  Par <strong>{h.modifie_par_nom ?? "—"}</strong> ·{" "}
                  <time dateTime={h.created_at} title={formatDateTime(h.created_at)}>
                    {formatRelative(h.created_at)}
                  </time>
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Carte>
  );
}
