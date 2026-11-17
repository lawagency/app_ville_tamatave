export const TYPES_CONTROLE = {
  terrain: "Terrain",
  bureau: "Bureau",
  qr_scan: "Scan QR",
  recherche_manuelle: "Recherche manuelle",
};

export const RESULTATS_CONTROLE = {
  autorise: { label: "Autorisé", tone: "success" },
  a_renouveler: { label: "À renouveler", tone: "warning" },
  non_autorise: { label: "Non autorisé", tone: "danger" },
  en_verification: { label: "En vérification", tone: "muted" },
} as const;

export const TYPES_ANOMALIE = {
  document_manquant: "Document manquant",
  document_expire: "Document expiré",
  chauffeur_non_affecte: "Chauffeur non affecté",
  chauffeur_blackliste: "Chauffeur blacklisté",
  vehicule_non_enregistre: "Véhicule non enregistré",
  paiement_impaye: "Paiement impayé",
  qr_invalide: "QR invalide",
  autre: "Autre",
};

export const GRAVITES = {
  basse: "Basse",
  normale: "Normale",
  haute: "Haute",
  critique: "Critique",
};

export type Anomalie = {
  type_anomalie: keyof typeof TYPES_ANOMALIE;
  gravite: keyof typeof GRAVITES;
  description: string;
};

export type Controle = {
  id: number;
  date_controle: string;
  agent_identifiant: string | null;
  vehicule_id: number | null;
  chauffeur_id: number | null;
  proprietaire_id: number | null;
  type_controle: keyof typeof TYPES_CONTROLE;
  resultat: keyof typeof RESULTATS_CONTROLE;
  observations: string | null;
  immatriculation: string | null;
  chauffeur_nom: string | null;
};
