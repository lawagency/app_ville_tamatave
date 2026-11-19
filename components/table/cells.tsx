import type { ReactNode } from "react";

export type Tone = "primary" | "success" | "warning" | "danger" | "muted";

const DOT: Record<Tone, string> = {
  primary: "bg-primary",
  success: "bg-secondary",
  warning: "bg-accent",
  danger: "bg-danger",
  muted: "bg-text-muted",
};

const BAR = DOT;

function initiales(texte: string) {
  return texte
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((mot) => mot[0].toUpperCase())
    .join("");
}

type AvatarProps = {
  label: string;
  icon?: ReactNode;
  /** URL de la photo ; à défaut, l'icône ou les initiales. */
  photo?: string | null;
  className?: string;
};

/** Pastille ronde : photo, sinon icône, sinon initiales. */
export function Avatar({ label, icon, photo, className = "size-11" }: AvatarProps) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-background text-sm font-bold text-primary ${className}`}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- image servie par l'API
        <img src={photo} alt={label} className="size-full object-cover" />
      ) : (
        (icon ?? initiales(label))
      )}
    </span>
  );
}

type CellTitleProps = {
  title: string;
  subtitle?: ReactNode;
  icon?: ReactNode;
  photo?: string | null;
};

/** Première colonne : avatar + nom en gras + information secondaire. */
export function CellTitle({ title, subtitle, icon, photo }: CellTitleProps) {
  return (
    <div className="flex items-center gap-4">
      <Avatar label={title} icon={icon} photo={photo} />
      <div className="min-w-0">
        <p className="truncate font-semibold text-text-main">{title}</p>
        {subtitle && <p className="truncate text-sm text-text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}

/** Statut : point de couleur + libellé (la couleur n'est jamais seule). */
export function StatusDot({ tone, label }: { tone: Tone; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`size-2 rounded-full ${DOT[tone]}`} />
      {label}
    </span>
  );
}

export function ActifDot({ actif }: { actif: boolean }) {
  return <StatusDot tone={actif ? "success" : "muted"} label={actif ? "Actif" : "Inactif"} />;
}

type ProgressProps = {
  value: number;
  max: number;
  tone?: Tone;
  label?: string;
};

/** Barre de progression avec la valeur écrite à gauche. */
export function Progress({ value, max, tone = "primary", label }: ProgressProps) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 text-sm">{label ?? `${pct}%`}</span>
      <div className="h-1 w-32 overflow-hidden rounded-full bg-border">
        <div className={`h-full rounded-full ${BAR[tone]}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
