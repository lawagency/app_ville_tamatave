import { create } from "zustand";
import { persist } from "zustand/middleware";

type UiState = {
  sidebarCollapsed: boolean;
  notificationsOpen: boolean;
  /** Recherche des propriétaires, partagée entre la barre de recherche globale et la page. */
  proprietaireSearch: string;
  /** Id du dernier espace ouvert, mis en avant sur la page des espaces. */
  dernierEspace: string | null;
  toggleSidebar: () => void;
  setNotificationsOpen: (open: boolean) => void;
  setProprietaireSearch: (value: string) => void;
  setDernierEspace: (id: string) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      notificationsOpen: false,
      proprietaireSearch: "",
      dernierEspace: null,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setNotificationsOpen: (open) => set({ notificationsOpen: open }),
      setProprietaireSearch: (value) => set({ proprietaireSearch: value }),
      setDernierEspace: (id) => set({ dernierEspace: id }),
    }),
    {
      name: "ui",
      // Seules les préférences d'affichage sont gardées d'une visite à l'autre
      partialize: ({ sidebarCollapsed, dernierEspace }) => ({ sidebarCollapsed, dernierEspace }),
    },
  ),
);
