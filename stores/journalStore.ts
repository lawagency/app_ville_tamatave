import { createCrudStore } from "./createCrudStore";
import type { JournalActivite } from "@/types";

/** Journal en lecture seule : seul `fetchAll` est utilisé. */
export const useJournalStore = createCrudStore<JournalActivite>("/journal-activites");
