/** Plateformes publiques (hors administration) : propriétaire et chauffeur. */
export type Portail = {
  /** Code du rôle (`roles.code`) autorisé sur ce portail. */
  role: "proprietaire" | "chauffeur";
  /** Racine : accueil, puis `/login`, `/compte-non-actif`, `/espace`. */
  base: string;
  /** « Espace propriétaire » */
  libelle: string;
  /** « propriétaire » : pour les phrases. */
  qui: string;
  /** Inscription en ligne possible (sinon, compte créé par la mairie). */
  inscription: boolean;
};

export const PORTAIL_PROPRIETAIRE: Portail = {
  role: "proprietaire",
  base: "/proprietaire",
  libelle: "Espace propriétaire",
  qui: "propriétaire",
  inscription: true,
};

export const PORTAIL_CHAUFFEUR: Portail = {
  role: "chauffeur",
  base: "/chauffeur",
  libelle: "Espace chauffeur",
  qui: "chauffeur",
  inscription: false,
};
