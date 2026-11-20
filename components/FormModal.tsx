"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X, type LucideIcon } from "lucide-react";
import { useUiStore } from "@/stores";
import LoadingButton from "./LoadingButton";

type FormModalProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  pending?: boolean;
  /** Change la clé pour réinitialiser les champs (création / autre fiche). */
  formKey?: string | number;
  /** `sm` : une colonne, `md` : deux colonnes, `lg` : contenu large (grille de permissions…). */
  size?: "sm" | "md" | "lg";
  /** `ecran` : pages sans menu latéral (plateforme propriétaire). */
  centrage?: "contenu" | "ecran";
  children: ReactNode;
};

const LARGEURS = { sm: "max-w-lg", md: "max-w-2xl", lg: "max-w-4xl" };

/**
 * Formulaire de création / modification, utilisé partout : modale centrée sur la zone
 * de contenu, en-tête, sections, boutons fixés en bas.
 */
export default function FormModal({
  open,
  title,
  subtitle,
  onClose,
  onSubmit,
  submitLabel,
  pending,
  formKey,
  size = "md",
  centrage = "contenu",
  children,
}: FormModalProps) {
  const modaleRef = useRef<HTMLDivElement>(null);
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !pending && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, pending, onClose]);

  // Une seule barre de défilement : la page ne défile plus derrière la modale
  useEffect(() => {
    if (!open) return;
    const avant = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modaleRef.current
      ?.querySelector<HTMLElement>("input:not([type=hidden]), select, textarea")
      ?.focus();
    return () => {
      document.body.style.overflow = avant;
    };
  }, [open]);

  return (
    <>
      <div
        onClick={pending ? undefined : onClose}
        className={`fixed inset-0 z-40 bg-text-main/30 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Centrée sur la zone à droite du menu latéral */}
      <div
        className={`pointer-events-none fixed inset-y-0 right-0 z-50 flex items-center justify-center p-6 ${
          centrage === "ecran" ? "left-0" : sidebarCollapsed ? "left-20" : "left-60"
        }`}
      >
        <div
          ref={modaleRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={`flex max-h-full w-full flex-col rounded-lg bg-surface shadow-2xl transition-all duration-200 ${
            LARGEURS[size]
          } ${open ? "pointer-events-auto scale-100 opacity-100" : "scale-95 opacity-0"}`}
        >
          {open && (
            <form key={formKey} onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
              <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
                <div>
                  <h2 className="text-lg font-bold text-primary">{title}</h2>
                  {subtitle && <p className="mt-0.5 text-sm text-text-muted">{subtitle}</p>}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={pending}
                  className="icon-btn -mr-2"
                  aria-label="Fermer"
                >
                  <X className="size-5" />
                </button>
              </header>

              <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">{children}</div>

              <footer className="flex justify-end gap-3 rounded-b-lg border-t border-border bg-background px-6 py-4">
                <button type="button" onClick={onClose} disabled={pending} className="btn-ghost">
                  Annuler
                </button>
                <LoadingButton type="submit" loading={pending} className="btn-primary">
                  {submitLabel}
                </LoadingButton>
              </footer>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

type FormSectionProps = {
  title: string;
  icon?: LucideIcon;
  /** Nombre de colonnes de la grille de champs. */
  columns?: 1 | 2 | 3;
  children: ReactNode;
};

const GRILLES = { 1: "", 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3" };

/** Groupe de champs avec titre, utilisé dans tous les formulaires. */
export function FormSection({ title, icon: Icon, columns = 2, children }: FormSectionProps) {
  return (
    <fieldset>
      <legend className="card-title mb-4 flex items-center gap-2">
        {Icon && <Icon className="size-4 text-primary" />}
        {title}
      </legend>
      <div className={`grid gap-4 ${GRILLES[columns]}`}>{children}</div>
    </fieldset>
  );
}
