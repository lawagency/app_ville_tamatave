import { createCrudStore } from "./createCrudStore";
import type { Role } from "@/types";

export const useRolesStore = createCrudStore<Role>("/roles");
