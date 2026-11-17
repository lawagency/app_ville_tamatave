import { createCrudStore } from "./createCrudStore";
import type { Controle } from "@/types";

export const useControlesStore = createCrudStore<Controle>("/controles");
