import { create } from "zustand";
import type { StatutUser } from "@/types";

export type ContactMairie = {
  nom: string;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
};

type CompteNonActif = {
  statut: StatutUser;
  mairie: ContactMairie | null;
};

/**
 * Connexion refusée (compte non actif) : transmis de la page de connexion à la page dédiée.
 * En mémoire seulement : rien n'est gardé après un rechargement.
 */
export const useCompteNonActifStore = create<{
  compte: CompteNonActif | null;
  definir: (compte: CompteNonActif) => void;
}>()((set) => ({
  compte: null,
  definir: (compte) => set({ compte }),
}));
