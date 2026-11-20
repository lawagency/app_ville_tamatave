import { useAuthStore } from "@/stores/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Method = "GET" | "POST" | "PATCH" | "DELETE";

/** Erreur de l'API : garde le code HTTP et la réponse complète (champs en plus du message). */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly donnees: Record<string, unknown> | null,
  ) {
    super(message);
  }
}

/** `body` en `FormData` : envoi multipart (fichiers), sinon JSON. */
export async function api<T>(path: string, method: Method = "GET", body?: unknown): Promise<T> {
  const { token, logout } = useAuthStore.getState();
  const multipart = body instanceof FormData;
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      // En multipart, le navigateur fixe lui-même le Content-Type avec la frontière
      ...(multipart ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : multipart ? body : JSON.stringify(body),
  });

  if (res.status === 401 && path !== "/auth/login") logout();

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.message;
    throw new ApiError(
      Array.isArray(message) ? message.join(", ") : (message ?? `Erreur ${res.status}`),
      res.status,
      data,
    );
  }
  return data as T;
}

/** URL d'un fichier enregistré par l'API (`storages/…`), à partir du chemin stocké en base. */
export function fichierUrl(chemin?: string | null) {
  if (!chemin) return null;
  if (/^(https?:|data:|blob:)/.test(chemin)) return chemin;
  return `${API_URL}/storages/${chemin.replace(/^\/?(storages\/)?/, "")}`;
}

/** Lit un formulaire en ignorant les champs vides et en convertissant les champs numériques. */
export function readForm(form: HTMLFormElement, numberFields: string[] = []) {
  const values: Record<string, string | number> = {};
  for (const [key, value] of new FormData(form)) {
    if (typeof value !== "string" || value.trim() === "") continue;
    values[key] = numberFields.includes(key) ? Number(value) : value.trim();
  }
  return values;
}

export function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString("fr-FR") : "—";
}

/** « 17/11/2026 à 08:50 ». */
export function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return `${date.toLocaleDateString("fr-FR")} à ${date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

/** « 08:50 » si c'est aujourd'hui, sinon « 3 j ». */
export function formatRelative(value: string) {
  const date = new Date(value);
  const jours = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (jours < 1) return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return `${jours} j`;
}
