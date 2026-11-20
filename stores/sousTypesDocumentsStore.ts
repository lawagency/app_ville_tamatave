import { createCrudStore } from "./createCrudStore";
import type { SousTypeDocument } from "@/types";

export const useSousTypesDocumentsStore = createCrudStore<SousTypeDocument>(
  "/types-documents-sous-types",
);
