import { completionDe, type ChampACompleter } from "@/components/portail/ProfilElements";
import type { Proprietaire } from "@/types";

/** Informations que le propriétaire complète lui-même (base du pourcentage). */
export const A_COMPLETER: ChampACompleter<Proprietaire>[] = [
  { champ: "photo_chemin", label: "Photo" },
  { champ: "cin", label: "CIN" },
  { champ: "date_naissance", label: "Date de naissance" },
  { champ: "lieu_naissance", label: "Lieu de naissance" },
  { champ: "sexe", label: "Sexe" },
  { champ: "profession", label: "Profession" },
  { champ: "telephone_principal", label: "Téléphone" },
  { champ: "adresse", label: "Adresse" },
];

export const completion = (fiche: Proprietaire) => completionDe(fiche, A_COMPLETER);
