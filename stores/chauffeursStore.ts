import { createCrudStore } from "./createCrudStore";
import type { Chauffeur } from "@/types";

export const useChauffeursStore = createCrudStore<Chauffeur>("/chauffeurs");
