import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";
import { dataLoader } from "@/lib/dataLoader";
import type { LoginResponse, SessionUser } from "@/types";

type AuthState = {
  token: string | null;
  user: SessionUser | null;
  /** Passe à `true` une fois la session relue depuis localStorage. */
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hydrated: false,

      login: async (email, password) => {
        const res = await api<LoginResponse>("/auth/login", "POST", {
          email,
          password,
        });
        set({ token: res.access_token, user: res.user });
      },

      logout: () => {
        dataLoader.clear();
        set({ token: null, user: null });
      },
    }),
    {
      name: "auth",
      partialize: ({ token, user }) => ({ token, user }),
      // Relue manuellement côté client pour éviter un écart d'hydratation avec le rendu serveur
      skipHydration: true,
      onRehydrateStorage: () => () => useAuthStore.setState({ hydrated: true }),
    },
  ),
);
