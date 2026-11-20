import { createCrudStore } from "./createCrudStore";
import type { Vehicule } from "@/types";

export const useVehiculesStore = createCrudStore<Vehicule>("/vehicules");

/** Véhicules du propriétaire connecté (espace propriétaire). */
export const useMesVehiculesStore = createCrudStore<Vehicule>("/vehicules/mes-vehicules");
