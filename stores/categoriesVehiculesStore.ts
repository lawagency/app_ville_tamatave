import { createCrudStore } from "./createCrudStore";
import type { CategorieVehicule } from "@/types";

export const useCategoriesVehiculesStore =
  createCrudStore<CategorieVehicule>("/categories-vehicules");
