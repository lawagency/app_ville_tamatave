import { createCrudStore } from "./createCrudStore";
import type { UniteControle } from "@/types";

export const useUnitesControleStore = createCrudStore<UniteControle>("/unites-controle");
