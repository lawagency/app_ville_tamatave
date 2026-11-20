/** Statut du véhicule (colonne `vehicules.statut`), décidé par la mairie. */
export const STATUTS_VEHICULE = {
  en_attente_verification: { label: "En vérification", tone: "warning" },
  dossier_incomplet: { label: "Dossier incomplet", tone: "warning" },
  en_regle: { label: "En règle", tone: "success" },
  document_expire: { label: "Document expiré", tone: "danger" },
  autorisation_a_renouveler: { label: "Autorisation à renouveler", tone: "warning" },
  immobilise: { label: "Immobilisé", tone: "danger" },
  suspendu: { label: "Suspendu", tone: "danger" },
  radie: { label: "Radié", tone: "muted" },
} as const;

export type StatutVehicule = keyof typeof STATUTS_VEHICULE;

/** Autorisation de circuler (colonne `vehicules.autorisation_circulation`). */
export const AUTORISATIONS_CIRCULATION = {
  a_verifier: { label: "À vérifier", tone: "warning" },
  valide: { label: "Valide", tone: "success" },
  a_renouveler: { label: "À renouveler", tone: "warning" },
  expiree: { label: "Expirée", tone: "danger" },
  suspendue: { label: "Suspendue", tone: "danger" },
} as const;

export type AutorisationCirculation = keyof typeof AUTORISATIONS_CIRCULATION;

export type Vehicule = {
  id: number;
  identifiant: string;
  immatriculation: string;
  /** Nom donné au véhicule pour le reconnaître (facultatif). */
  nom: string | null;
  type_id: number | null;
  type_nom: string | null;
  categorie_id: number | null;
  categorie_nom: string | null;
  marque: string | null;
  modele: string | null;
  couleur: string | null;
  numero_chassis: string | null;
  date_premiere_circulation: string | null;
  notes: string | null;
  photo_chemin: string | null;
  statut: StatutVehicule;
  autorisation_circulation: AutorisationCirculation;
  est_a_vendre: boolean;
  est_vendu: boolean;
  date_enregistrement: string;
  /** Propriétaire actuel (jointure proprietaires). */
  proprietaire_actuel_id: number | null;
  proprietaire_identifiant: string | null;
  proprietaire_nom: string | null;
  proprietaire_telephone: string | null;
  /** Chauffeur actuel (jointure chauffeurs + attribution en cours). */
  chauffeur_actuel_id: number | null;
  chauffeur_identifiant: string | null;
  chauffeur_nom: string | null;
  chauffeur_telephone: string | null;
  chauffeur_photo_chemin: string | null;
  /** Type du chauffeur actuel (Joker…), configuré dans Types de chauffeurs. */
  chauffeur_type_nom: string | null;
  created_at: string;
};

/** Validation par la mairie d'une propriété ou d'une attribution. */
export const VALIDATIONS = {
  en_attente: { label: "En attente", tone: "warning" },
  validee: { label: "Validée", tone: "success" },
  rejetee: { label: "Rejetée", tone: "danger" },
  annulee: { label: "Annulée", tone: "muted" },
} as const;

export type Validation = keyof typeof VALIDATIONS;

/** Ligne de `propriete_vehicules` (`GET /vehicules/:id/proprietes`). */
export type ProprieteVehicule = {
  id: number;
  proprietaire_id: number;
  proprietaire_identifiant: string;
  proprietaire_nom: string | null;
  pourcentage: string;
  date_debut: string;
  date_fin: string | null;
  actif: boolean;
  source: "initiale" | "vente" | "heritage" | "correction";
  statut_validation: Validation;
  valide_par_nom: string | null;
};

/** Ligne de `attributions_chauffeurs` (`GET /vehicules/:id/attributions`). */
export type AttributionChauffeur = {
  id: number;
  chauffeur_id: number;
  chauffeur_identifiant: string;
  chauffeur_nom: string | null;
  chauffeur_type_nom: string | null;
  date_debut: string;
  date_fin: string | null;
  actif: boolean;
  statut_validation: Validation;
  valide_par_nom: string | null;
};

/** Ligne de `vehicules_statuts_historique` (`GET /vehicules/:id/historique`). */
export type HistoriqueStatutVehicule = {
  id: number;
  ancien_statut: StatutVehicule | null;
  nouveau_statut: StatutVehicule;
  justification: string;
  modifie_par_nom: string | null;
  created_at: string;
};

/** Listes du formulaire du propriétaire (`GET /vehicules/mes-vehicules/options`). */
export type OptionsVehicule = {
  types: { id: number; nom: string }[];
  categories: { id: number; nom: string }[];
};

/** « Toyota Corolla », sinon « — ». */
export const marqueModele = (v: Pick<Vehicule, "marque" | "modele">) =>
  [v.marque, v.modele].filter(Boolean).join(" ") || null;
