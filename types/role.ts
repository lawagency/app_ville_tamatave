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
  chauffeurs: "Chauffeurs",
  vehicules: "Véhicules",
  controles: "Contrôles",
  types_documents: "Types de documents",
  types_documents_sous_types: "Sous-types de documents",
  types_vehicules: "Types de véhicules",
  categories_vehicules: "Catégories de véhicules",
  types_chauffeurs: "Types de chauffeurs",
  journal: "Journal d'activité",
  // Espace propriétaire
  mes_chauffeurs: "Mes chauffeurs",
  mes_vehicules: "Mes véhicules",
};

/** Modules de l'espace propriétaire : accordés au rôle `proprietaire`, pas à la mairie. */
export const MODULES_ESPACE_PROPRIETAIRE: string[] = ["mes_chauffeurs", "mes_vehicules"];

export const ACTIONS = {
  voir: "Voir",
  creer: "Créer",
  modifier: "Modifier",
  supprimer: "Supprimer",
  blacklister: "Liste noire",
};

type ModuleCode = keyof typeof MODULES;
type ActionCode = keyof typeof ACTIONS;

const ACTIONS_DE_BASE: ActionCode[] = ["voir", "creer", "modifier", "supprimer"];

/** Modules dont les actions diffèrent des quatre de base. */
const ACTIONS_SPECIFIQUES: Partial<Record<ModuleCode, ActionCode[]>> = {
  // Lecture seule
  journal: ["voir"],
  // Mise sur liste noire / retrait (`chauffeurs.blacklister`)
  chauffeurs: [...ACTIONS_DE_BASE, "blacklister"],
  // Le propriétaire ne supprime pas un véhicule : la mairie le radie
  mes_vehicules: ["voir", "creer", "modifier"],
};

/** Actions qu'on peut accorder sur ce module. */
export const actionsDuModule = (module: string): ActionCode[] =>
  ACTIONS_SPECIFIQUES[module as ModuleCode] ?? ACTIONS_DE_BASE;

const totalDe = (modules: string[]) => modules.reduce((n, m) => n + actionsDuModule(m).length, 0);

/** Nombre total de permissions possibles dans l'administration. */
export const TOTAL_PERMISSIONS = totalDe(
  Object.keys(MODULES).filter((m) => !MODULES_ESPACE_PROPRIETAIRE.includes(m)),
);

/** Nombre total de permissions possibles dans l'espace propriétaire. */
export const TOTAL_PERMISSIONS_PROPRIETAIRE = totalDe(MODULES_ESPACE_PROPRIETAIRE);
