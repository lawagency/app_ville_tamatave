export type Commune = {
  id: number;
  nom: string;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  nif: string | null;
  stat: string | null;
  logo_chemin: string | null;
  actif: boolean;
};
