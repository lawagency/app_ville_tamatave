/* Exemple : { users: { voir: true, creer: false } } */
export type Permissions = Record<string, Record<string, boolean>>;

export type Role = {
  id: number;
  code: string;
  nom: string;
  description: string | null;
  permissions: Permissions;
  actif: boolean;
  est_systeme?: boolean;
};

/** Modules protégés par l'API (`@Permissions('<module>.<action>')`). */
export const MODULES = {
  users: "Utilisateurs",
  roles: "Rôles",
  communes: "Infos mairie",
  identifiants: "Format des identifiants",
  unites: "Unités de contrôle",
  categories: "Catégories de services",
  proprietaires: "Propriétaires",
  controles: "Contrôles",
};

export const ACTIONS = {
  voir: "Voir",
  creer: "Créer",
  modifier: "Modifier",
  supprimer: "Supprimer",
};
