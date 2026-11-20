import { createCrudStore } from "./createCrudStore";
import type { TypeChauffeur } from "@/types";

export const useTypesChauffeursStore = createCrudStore<TypeChauffeur>("/types-chauffeurs");
