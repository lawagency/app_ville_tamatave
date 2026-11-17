import { createCrudStore } from "./createCrudStore";
import type { Proprietaire } from "@/types";

export const useProprietairesStore = createCrudStore<Proprietaire>("/proprietaires");
