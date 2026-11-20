"use client";

import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import LoadingButton from "./LoadingButton";
import { useUiStore } from "@/stores";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: "md" | "lg";
};

/** Modale centrée sur la zone de contenu, à droite du menu latéral (réduit ou non). */
export default function Modal({ open, title, onClose, children, size = "md" }: ModalProps) {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-text-main/40" onClick={onClose} />
      <div
        className={`pointer-events-none fixed inset-y-0 right-0 z-50 flex items-center justify-center p-6 transition-[left] duration-200 ${
          sidebarCollapsed ? "left-20" : "left-60"
        }`}
      >
        <div
          role="dialog"
          aria-modal="true"
          className={`card pointer-events-auto flex max-h-full w-full flex-col p-0 shadow-xl ${
            size === "lg" ? "max-w-3xl" : "max-w-lg"
          }`}
        >
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold text-primary">{title}</h2>
            <button onClick={onClose} className="icon-btn" aria-label="Fermer">
              <X className="size-5" />
            </button>
          </div>
          <div className="overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </>
  );
}

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  error?: string;
  /** Si elle renvoie une promesse, le bouton affiche le chargement jusqu'à sa fin. */
  onConfirm: () => void | Promise<unknown>;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Supprimer",
  error,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  async function confirmer() {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="space-y-4">
        {error && <p className="alert-error">{error}</p>}
        <div className="text-text-main">{message}</div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} disabled={loading} className="btn-ghost">
            Annuler
          </button>
          <LoadingButton onClick={confirmer} loading={loading} className="btn-danger-solid">
            {confirmLabel}
          </LoadingButton>
        </div>
      </div>
    </Modal>
  );
}
