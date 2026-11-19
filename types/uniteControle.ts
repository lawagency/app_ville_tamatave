/** Catégorie de service (table `types_corps_controle`) : Police, Gendarmerie… */
export type CategorieService = {
  id: number;
  nom: string;
  description: string | null;
  actif: boolean;
};

/** Unité de contrôle (table `corps_controle`) : accès au portail par code. */
export type UniteControle = {
  id: number;
  nom: string;
  type_corps_id: number;
  /** Nom de la catégorie, joint par la liste. */
  type_nom?: string;
  code_acces: string;
  date_expiration: string | null;
  notes: string | null;
  actif: boolean;
  commune_id: number | null;
};
