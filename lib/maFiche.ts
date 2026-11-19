import type { Proprietaire } from "@/types";

/** Informations que le propriétaire complète lui-même (base du pourcentage). */
export const A_COMPLETER: { champ: keyof Proprietaire; label: string }[] = [
  { champ: "photo_chemin", label: "Photo" },
  { champ: "cin", label: "CIN" },
  { champ: "date_naissance", label: "Date de naissance" },
  { champ: "lieu_naissance", label: "Lieu de naissance" },
  { champ: "sexe", label: "Sexe" },
  { champ: "profession", label: "Profession" },
  { champ: "telephone_principal", label: "Téléphone" },
  { champ: "adresse", label: "Adresse" },
];

export function completion(fiche: Proprietaire) {
  const manquants = A_COMPLETER.filter(({ champ }) => !fiche[champ]);
  const pct = Math.round(((A_COMPLETER.length - manquants.length) / A_COMPLETER.length) * 100);
  return { manquants, pct };
}
