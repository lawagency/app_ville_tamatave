export const STATUTS_USER = {
  en_attente: {
    label: "En attente",
    tone: "warning",
    description: "Compte créé, en attente de vérification des documents.",
  },
  actif: {
    label: "Actif",
    tone: "success",
    description: "Compte validé : l'agent peut se connecter.",
  },
  inactif: {
    label: "Inactif",
    tone: "muted",
    description: "Compte désactivé, sans faute reprochée.",
  },
  rejete: {
    label: "Rejeté",
    tone: "danger",
    description: "Refus initial de la demande (documents faux ou incomplets). Définitif.",
  },
  suspendu: {
    label: "Suspendu",
    tone: "danger",
    description: "Blocage temporaire d'un compte actif (faute, enquête en cours). Réactivable.",
  },
} as const;

/** Seul un compte `actif` peut se connecter. */
export type StatutUser = keyof typeof STATUTS_USER;

export type User = {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  role_id: number;
  statut: StatutUser;
  date_validation: string | null;
  derniere_connexion: string | null;
  /** Absents tant que l'API ne les renvoie pas dans la liste. */
  email_verifie?: boolean;
  telephone_verifie?: boolean;
};
