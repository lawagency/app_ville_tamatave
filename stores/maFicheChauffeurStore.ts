import { create } from "zustand";
import { api } from "@/lib/api";
import type { Chauffeur } from "@/types";

type MaFicheChauffeurState = {
  fiche: Chauffeur | null;
  loading: boolean;
  error?: string;
  charger: () => Promise<void>;
  modifier: (body: object) => Promise<void>;
  envoyerPhoto: (photo: File) => Promise<void>;
  vider: () => void;
};

/** Fiche du chauffeur connecté (`/chauffeurs/moi`), partagée entre les pages de son espace. */
export const useMaFicheChauffeurStore = create<MaFicheChauffeurState>()((set) => ({
  fiche: null,
  loading: false,
  error: undefined,

  charger: async () => {
    set({ loading: true, error: undefined });
    try {
      set({ fiche: await api<Chauffeur>("/chauffeurs/moi"), loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  // Les réponses passent par findOne côté API : jointures (type, propriétaire) comprises
  modifier: async (body) => {
    set({ fiche: await api<Chauffeur>("/chauffeurs/moi", "PATCH", body) });
  },

  envoyerPhoto: async (photo) => {
    const envoi = new FormData();
    envoi.append("photo", photo);
    set({ fiche: await api<Chauffeur>("/chauffeurs/moi/photo", "POST", envoi) });
  },

  vider: () => set({ fiche: null, error: undefined }),
}));
