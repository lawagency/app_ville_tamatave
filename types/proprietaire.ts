import type { StatutUser } from "./user";

/** Statut de la fiche propriétaire (colonne `proprietaires.statut`). */
export const STATUTS_FICHE = {
  en_verification: { label: "En vérification", tone: "warning" },
  dossier_incomplet: { label: "Dossier incomplet", tone: "warning" },
  actif: { label: "Fiche validée", tone: "success" },
  suspendu: { label: "Suspendue", tone: "danger" },
  inactif: { label: "Inactive", tone: "muted" },
  radie: { label: "Radiée", tone: "danger" },
} as const;

export type StatutFiche = keyof typeof STATUTS_FICHE;

export type Proprietaire = {
  id: number;
  identifiant: string;
  nom: string;
  prenom: string;
  date_naissance: string | null;
  lieu_naissance: string | null;
  sexe: "M" | "F" | null;
  telephone_principal: string;
  telephone_secondaire: string | null;
  email: string | null;
  adresse: string | null;
  profession: string | null;
  cin: string | null;
  notes: string | null;
  photo_chemin: string | null;
  statut?: StatutFiche;
  /** Compte de connexion à l'espace propriétaire. */
  user_id: number | null;
  compte_email: string | null;
  compte_statut: StatutUser | null;
  created_at: string;
};
