import { api } from "./api";

type CacheEntry = {
  data: unknown;
  at: number;
};

/**
 * Point d'entrée unique pour charger les listes de l'API.
 * - une seule requête à la fois par URL (les appels simultanés partagent la même promesse) ;
 * - réponse gardée en cache pendant `ttl` ms ;
 * - `clear()` vide tout (déconnexion) et prévient les stores abonnés.
 */
class DataLoader {
  private static instance: DataLoader | undefined;

  private readonly pending = new Map<string, Promise<unknown>>();
  private readonly cache = new Map<string, CacheEntry>();
  private readonly clearListeners = new Set<() => void>();

  private constructor(private readonly ttl: number) {}

  static getInstance() {
    DataLoader.instance ??= new DataLoader(60_000);
    return DataLoader.instance;
  }

  async get<T>(path: string, { force = false } = {}): Promise<T> {
    const cached = this.cache.get(path);
    if (!force && cached && Date.now() - cached.at < this.ttl) return cached.data as T;

    const enCours = this.pending.get(path);
    if (enCours) return enCours as Promise<T>;

    const request = api<T>(path)
      .then((data) => {
        this.cache.set(path, { data, at: Date.now() });
        return data;
      })
      .finally(() => this.pending.delete(path));

    this.pending.set(path, request);
    return request;
  }

  invalidate(path: string) {
    this.cache.delete(path);
  }

  clear() {
    this.cache.clear();
    this.pending.clear();
    this.clearListeners.forEach((listener) => listener());
  }

  onClear(listener: () => void) {
    this.clearListeners.add(listener);
  }
}

export const dataLoader = DataLoader.getInstance();
