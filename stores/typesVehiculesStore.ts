import { createCrudStore } from "./createCrudStore";
import type { TypeVehicule } from "@/types";

export const useTypesVehiculesStore = createCrudStore<TypeVehicule>("/types-vehicules");
