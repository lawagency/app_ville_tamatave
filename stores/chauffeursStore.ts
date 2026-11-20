import { createCrudStore } from "./createCrudStore";
import type { Chauffeur } from "@/types";

export const useChauffeursStore = createCrudStore<Chauffeur>("/chauffeurs");

/** Chauffeurs du propriétaire connecté (espace propriétaire). */
export const useMesChauffeursStore = createCrudStore<Chauffeur>("/chauffeurs/mes-chauffeurs");
