import { createCrudStore } from "./createCrudStore";
import type { Commune } from "@/types";

export const useCommunesStore = createCrudStore<Commune>("/communes");
