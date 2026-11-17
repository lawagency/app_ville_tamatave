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
  created_at: string;
};
