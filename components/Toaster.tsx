"use client";

import { CircleAlert, CircleCheck, Info, X, type LucideIcon } from "lucide-react";
import { useToastStore, type ToastType } from "@/stores";

const STYLES: Record<ToastType, { icon: LucideIcon; couleur: string; bordure: string }> = {
  success: { icon: CircleCheck, couleur: "text-secondary", bordure: "border-l-secondary" },
  error: { icon: CircleAlert, couleur: "text-danger", bordure: "border-l-danger" },
  info: { icon: Info, couleur: "text-primary", bordure: "border-l-primary" },
};

/** Notifications en haut à droite, qui arrivent en glissant depuis la droite. */
export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-20 z-[60] flex w-96 max-w-[calc(100vw-2rem)] flex-col gap-3"
    >
      {toasts.map((t) => {
        const { icon: Icon, couleur, bordure } = STYLES[t.type];
        return (
          <div
            key={t.id}
            role={t.type === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex animate-slide-in items-start gap-3 rounded-md border border-l-4 border-border bg-surface p-4 shadow-lg ${bordure}`}
          >
            <Icon className={`mt-0.5 size-5 shrink-0 ${couleur}`} />
            <p className="flex-1 text-sm text-text-main">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="text-text-muted hover:text-text-main"
              aria-label="Fermer"
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
