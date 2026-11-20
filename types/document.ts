/** À qui un type de document s'applique (colonne `types_documents.cibles`). */
export const CIBLES_DOCUMENT = {
  proprietaire: "Propriétaire",
  vehicule: "Véhicule",
  chauffeur: "Chauffeur",
} as const;

export type CibleDocument = keyof typeof CIBLES_DOCUMENT;

export const UNITES_DUREE = {
  jour: { un: "jour", plusieurs: "jours" },
  mois: { un: "mois", plusieurs: "mois" },
  annee: { un: "an", plusieurs: "ans" },
} as const;

export type UniteDuree = keyof typeof UNITES_DUREE;

/** Type de document (table `types_documents`) : carte grise, assurance, permis… */
export type TypeDocument = {
  id: number;
  nom: string;
  /** Durée de validité ; vide : le document n'expire pas. */
  duree_valeur: number | null;
  duree_unite: UniteDuree | null;
  cibles: CibleDocument[];
  actif: boolean;
  created_at: string;
};

/** Sous-type d'un type de document (table `types_documents_sous_types`) : catégories de permis… */
export type SousTypeDocument = {
  id: number;
  type_document_id: number;
  nom: string;
  description: string | null;
  actif: boolean;
  /** Nom du type parent, joint par la liste. */
  type_document_nom?: string;
};
