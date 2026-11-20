import { createCrudStore } from "./createCrudStore";
import type { TypeDocument } from "@/types";

export const useTypesDocumentsStore = createCrudStore<TypeDocument>("/types-documents");
