import type { StatutUser } from "./user";

/** Statut de la fiche chauffeur (colonne `chauffeurs.statut`). */
export const STATUTS_CHAUFFEUR = {
  en_attente_verification: { label: "En vérification", tone: "warning" },
  dossier_incomplet: { label: "Dossier incomplet", tone: "warning" },
  actif: { label: "Fiche validée", tone: "success" },
  suspendu: { label: "Suspendue", tone: "danger" },
  inactif: { label: "Inactive", tone: "muted" },
  radie: { label: "Radiée", tone: "danger" },
} as const;

export type StatutChauffeur = keyof typeof STATUTS_CHAUFFEUR;

/** Situation de travail du chauffeur (colonne `chauffeurs.statut_professionnel`). */
export const STATUTS_PROFESSIONNELS = {
  actif: { label: "Actif", tone: "success" },
  inactif: { label: "Inactif", tone: "muted" },
  suspendu: { label: "Suspendu", tone: "danger" },
} as const;

export type StatutProfessionnel = keyof typeof STATUTS_PROFESSIONNELS;

/** Libellé et ton de la situation ; une valeur inconnue s'affiche telle quelle. */
export const situationDe = (c: { statut_professionnel: string }) =>
  STATUTS_PROFESSIONNELS[c.statut_professionnel as StatutProfessionnel] ?? {
    label: c.statut_professionnel,
    tone: "muted" as const,
  };

/** Type de chauffeur (table `types_chauffeurs`) : « Joker » pour un cyclo-pousse… */
export type TypeChauffeur = {
  id: number;
  type_vehicule_id: number;
  /** Jointure `types_vehicules.nom`. */
  type_vehicule_nom: string;
  nom: string;
  description: string | null;
  actif: boolean;
  nombre_chauffeurs: number;
  created_at: string;
};

export type Chauffeur = {
  id: number;
  identifiant: string;
  type_chauffeur_id: number | null;
  type_chauffeur_nom: string | null;
  type_vehicule_id: number | null;
  type_vehicule_nom: string | null;
  nom: string;
  prenom: string;
  date_naissance: string | null;
  lieu_naissance: string | null;
  telephone: string | null;
  adresse: string | null;
  email: string | null;
  cin: string | null;
  notes: string | null;
  photo_chemin: string | null;
  statut: StatutChauffeur;
  statut_professionnel: StatutProfessionnel;
  est_blackliste: boolean;
  raison_blacklist: string | null;
  date_blacklist: string | null;
  date_enregistrement: string;
  /** Compte de connexion à l'espace chauffeur. */
  user_id: number | null;
  compte_email: string | null;
  compte_statut: StatutUser | null;
  /** Propriétaire qui l'emploie (ajouté depuis l'espace propriétaire ou par la mairie). */
  proprietaire_id: number | null;
  proprietaire_identifiant: string | null;
  proprietaire_nom: string | null;
  created_at: string;
};

/** Type actif proposé au propriétaire (`GET /chauffeurs/mes-chauffeurs/types`). */
export type TypeChauffeurPropose = Pick<
  TypeChauffeur,
  "id" | "nom" | "type_vehicule_id" | "type_vehicule_nom"
>;

/** Ligne de `chauffeurs_statuts_historique` (`GET /chauffeurs/:id/historique`). */
export type HistoriqueStatutChauffeur = {
  id: number;
  ancien_statut: StatutChauffeur | null;
  nouveau_statut: StatutChauffeur;
  justification: string;
  modifie_par: number | null;
  /** « Prénom Nom » de l'agent qui a changé le statut (jointure users). */
  modifie_par_nom: string | null;
  created_at: string;
};
