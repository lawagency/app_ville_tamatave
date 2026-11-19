import { createCrudStore } from "./createCrudStore";
import type { ParametreIdentifiant } from "@/types";

export const useParametresIdentifiantsStore = createCrudStore<ParametreIdentifiant>(
  "/parametres-indentifiants",
);
