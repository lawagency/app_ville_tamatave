export const CIBLES_IDENTIFIANT = {
  proprietaire: { label: "Propriétaires", prefixe: "PROP" },
  chauffeur: { label: "Chauffeurs", prefixe: "CHAUF" },
  vehicule: { label: "Véhicules", prefixe: "VEH" },
} as const;

export type CibleIdentifiant = keyof typeof CIBLES_IDENTIFIANT;

/** Format de numérotation d'une cible (table `parametres_identifiants`). */
export type ParametreIdentifiant = {
  id: number;
  commune_id: number;
  cible: CibleIdentifiant;
  prefixe: string | null;
  suffixe: string | null;
  longueur_sequence: number;
  separateur: string | null;
  /** Jetons : {PREFIXE} {SUFFIXE} {SEQ} {ANNEE} {MOIS} {SEP} */
  format_personnalise: string | null;
  actif: boolean;
};
