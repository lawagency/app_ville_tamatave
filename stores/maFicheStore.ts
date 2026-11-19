import { create } from "zustand";
import { api } from "@/lib/api";
import type { Proprietaire } from "@/types";

type MaFicheState = {
  fiche: Proprietaire | null;
  loading: boolean;
  error?: string;
  charger: () => Promise<void>;
  modifier: (body: object) => Promise<void>;
  envoyerPhoto: (photo: File) => Promise<void>;
  vider: () => void;
};

/** Fiche du propriétaire connecté, partagée entre les pages de son espace. */
export const useMaFicheStore = create<MaFicheState>()((set) => ({
  fiche: null,
  loading: false,
  error: undefined,

  charger: async () => {
    set({ loading: true, error: undefined });
    try {
      set({ fiche: await api<Proprietaire>("/proprietaires/moi"), loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  modifier: async (body) => {
    set({ fiche: await api<Proprietaire>("/proprietaires/moi", "PATCH", body) });
  },

  envoyerPhoto: async (photo) => {
    const envoi = new FormData();
    envoi.append("photo", photo);
    set({ fiche: await api<Proprietaire>("/proprietaires/moi/photo", "POST", envoi) });
  },

  vider: () => set({ fiche: null, error: undefined }),
}));
