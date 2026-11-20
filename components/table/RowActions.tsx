"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, MoreVertical, type LucideIcon } from "lucide-react";

export type RowAction = {
  label: string;
  icon: LucideIcon;
  /** Si elle renvoie une promesse, le bouton ⋮ affiche le chargement jusqu'à sa fin. */
  onClick: () => void | Promise<unknown>;
  /** Absent : action neutre. */
  variant?: "success" | "danger";
  disabled?: boolean;
  /** Explication affichée sous l'action quand elle est désactivée. */
  hint?: string;
  /** `false` : l'action n'est pas proposée sur cette ligne. */
  visible?: boolean;
};

const COULEURS = {
  success: "text-secondary",
  danger: "text-danger",
};

const HAUTEUR_ITEM = 40;
/** Espace gardé entre le menu et le bord de l'écran. */
const MARGE = 12;

type Position = { right: number; maxHeight: number } & ({ top: number } | { bottom: number });

/**
 * Bouton « ⋮ » qui ouvre la liste des actions de la ligne.
 * Le panneau est en `fixed` : il ne fait pas défiler le tableau et s'ouvre vers le haut
 * s'il n'y a pas la place en dessous.
 */
export default function RowActions({ actions }: { actions: RowAction[] }) {
  const [position, setPosition] = useState<Position | null>(null);
  const [pending, setPending] = useState(false);
  const visibles = actions.filter((a) => a.visible !== false);

  async function executer(action: RowAction) {
    setPosition(null);
    setPending(true);
    try {
      await action.onClick();
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    if (!position) return;
    const fermer = () => setPosition(null);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && fermer();
    window.addEventListener("scroll", fermer, true);
    window.addEventListener("resize", fermer);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", fermer, true);
      window.removeEventListener("resize", fermer);
      document.removeEventListener("keydown", onKey);
    };
  }, [position]);

  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    if (position) return setPosition(null);
    const rect = e.currentTarget.getBoundingClientRect();
    const right = window.innerWidth - rect.right;
    const hauteur = visibles.length * HAUTEUR_ITEM + 16;
    const dessous = window.innerHeight - rect.bottom - MARGE;
    const dessus = rect.top - MARGE;
    // Vers le bas comme partout ; vers le haut seulement s'il manque la place en bas
    // et qu'il y en a plus en haut. Un menu trop long défile au lieu de sortir de l'écran.
    setPosition(
      hauteur > dessous && dessus > dessous
        ? { right, bottom: window.innerHeight - rect.top + 4, maxHeight: dessus }
        : { right, top: rect.bottom + 4, maxHeight: dessous },
    );
  }

  if (visibles.length === 0) return null;

  return (
    // Un clic dans le menu ne doit pas ouvrir/fermer les détails de la ligne
    <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={toggle}
        disabled={pending}
        aria-label="Actions"
        aria-busy={pending}
        aria-expanded={position !== null}
        className={`rounded-md p-2 transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-wait ${
          position || pending ? "bg-primary/10 text-primary" : "text-text-muted"
        }`}
      >
        {pending ? (
          <LoaderCircle className="size-5 animate-spin" />
        ) : (
          <MoreVertical className="size-5" />
        )}
      </button>

      {position && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setPosition(null)} />
          <div
            role="menu"
            style={position}
            className="fixed z-40 min-w-48 overflow-y-auto rounded-md border border-border bg-surface p-1 shadow-lg"
          >
            {visibles.map((action) => {
              const { label, icon: Icon, variant, disabled, hint } = action;
              return (
                <button
                  key={label}
                  role="menuitem"
                  disabled={disabled}
                  onClick={() => executer(action)}
                  className={`flex w-full items-start gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent ${
                    variant ? COULEURS[variant] : "text-text-main"
                  }`}
                >
                  <Icon className="mt-0.5 size-4 shrink-0" />
                  <span>
                    <span className="block font-medium">{label}</span>
                    {disabled && hint && (
                      <span className="block text-xs text-text-muted">{hint}</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
