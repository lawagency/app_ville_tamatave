import { createCrudStore } from "./createCrudStore";
import type { CategorieService } from "@/types";

export const useCategoriesServicesStore = createCrudStore<CategorieService>("/categories-services");
