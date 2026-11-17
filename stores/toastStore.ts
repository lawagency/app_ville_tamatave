import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export type Toast = {
  id: number;
  type: ToastType;
  message: string;
};

const DUREE_MS = 4000;

type ToastState = {
  toasts: Toast[];
  push: (type: ToastType, message: string) => void;
  dismiss: (id: number) => void;
};

let prochainId = 1;

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],

  push: (type, message) => {
    const id = prochainId++;
    set({ toasts: [...get().toasts, { id, type, message }] });
    setTimeout(() => get().dismiss(id), DUREE_MS);
  },

  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

/** Raccourcis utilisables partout, y compris hors composant. */
export const toast = {
  success: (message: string) => useToastStore.getState().push("success", message),
  error: (message: string) => useToastStore.getState().push("error", message),
  info: (message: string) => useToastStore.getState().push("info", message),
};
