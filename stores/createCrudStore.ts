import { create } from "zustand";
import { api } from "@/lib/api";
import { dataLoader } from "@/lib/dataLoader";

export type CrudState<T> = {
  items: T[];
  loading: boolean;
  error?: string;
  /** Charge la liste via le `dataLoader` (cache partagé). `force` ignore le cache. */
  fetchAll: (options?: { force?: boolean }) => Promise<void>;
  create: (body: object) => Promise<T>;
  update: (id: number, body: object) => Promise<T>;
  remove: (id: number) => Promise<void>;
};

const ETAT_INITIAL = { items: [], loading: true, error: undefined };

/** Store standard pour une ressource REST de l'API (`GET`, `POST`, `PATCH /:id`, `DELETE /:id`). */
export function createCrudStore<T extends { id: number }>(path: string) {
  const store = create<CrudState<T>>()((set, get) => ({
    ...ETAT_INITIAL,

    fetchAll: async ({ force = false } = {}) => {
      // Pas d'indicateur de chargement si la liste est déjà affichée
      if (get().items.length === 0) set({ loading: true });
      set({ error: undefined });
      try {
        set({ items: await dataLoader.get<T[]>(path, { force }), loading: false });
      } catch (e) {
        set({ error: (e as Error).message, loading: false });
      }
    },

    // Rechargement forcé après écriture : les réponses de l'API sont partielles
    // et la liste contient des jointures
    create: async (body) => {
      const item = await api<T>(path, "POST", body);
      await get().fetchAll({ force: true });
      return item;
    },

    update: async (id, body) => {
      const item = await api<T>(`${path}/${id}`, "PATCH", body);
      await get().fetchAll({ force: true });
      return item;
    },

    remove: async (id) => {
      await api(`${path}/${id}`, "DELETE");
      await get().fetchAll({ force: true });
    },
  }));

  // À la déconnexion, on ne garde pas les données du compte précédent
  dataLoader.onClear(() => store.setState(ETAT_INITIAL));

  return store;
}
