/** Élément de paramétrage simple : un nom et un statut (types et catégories de véhicules). */
export type ElementSimple = {
  id: number;
  nom: string;
  actif: boolean;
  created_at: string;
};

/** Type de véhicule (table `types_vehicules`) : voiture, moto, tricycle… */
export type TypeVehicule = ElementSimple;

/** Catégorie de véhicule (table `categories_vehicules`) : taxi-ville, taxi-be, transport de marchandises… */
export type CategorieVehicule = ElementSimple;
