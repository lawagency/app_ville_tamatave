/** Ligne de `journal_activites` (`GET /journal-activites`), avec le nom de l'auteur. */
export type JournalActivite = {
  id: number;
  utilisateur_id: number | null;
  utilisateur_email: string | null;
  methode: "POST" | "PATCH" | "DELETE" | string;
  url: string;
  /** Corps de la requête (mots de passe masqués par l'API). */
  donnees_envoyees: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
  nom: string | null;
  prenom: string | null;
};
