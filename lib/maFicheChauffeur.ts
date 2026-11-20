import {
  Ban,
  CircleCheck,
  CircleMinus,
  CircleX,
  Clock,
  FileWarning,
  type LucideIcon,
} from "lucide-react";
import { completionDe, type ChampACompleter } from "@/components/portail/ProfilElements";
import { STATUTS_CHAUFFEUR, type Chauffeur, type StatutChauffeur } from "@/types";

/** Informations que le chauffeur complète lui-même (`MonProfilChauffeurDto` + photo). */
export const A_COMPLETER_CHAUFFEUR: ChampACompleter<Chauffeur>[] = [
  { champ: "photo_chemin", label: "Photo" },
  { champ: "cin", label: "CIN" },
  { champ: "date_naissance", label: "Date de naissance" },
  { champ: "lieu_naissance", label: "Lieu de naissance" },
  { champ: "telephone", label: "Téléphone" },
  { champ: "adresse", label: "Adresse" },
];

export const completionChauffeur = (fiche: Chauffeur) => completionDe(fiche, A_COMPLETER_CHAUFFEUR);

/** Ce que chaque statut de la fiche signifie pour le chauffeur. */
const EXPLICATIONS: Record<StatutChauffeur, { icon: LucideIcon; texte: string }> = {
  en_attente_verification: {
    icon: Clock,
    texte: "La mairie vérifie vos informations et vos pièces. Vous serez informé du résultat.",
  },
  dossier_incomplet: {
    icon: FileWarning,
    texte:
      "Il manque des informations ou des pièces. Complétez votre profil ou passez à la mairie.",
  },
  actif: {
    icon: CircleCheck,
    texte: "Votre dossier a été vérifié et validé par la mairie : vous pouvez conduire.",
  },
  suspendu: {
    icon: Ban,
    texte: "Votre dossier est suspendu. Rapprochez-vous de la mairie pour en connaître la raison.",
  },
  inactif: {
    icon: CircleMinus,
    texte: "Votre dossier n'est plus actif. Contactez la mairie pour le réactiver.",
  },
  radie: {
    icon: CircleX,
    texte: "Votre dossier a été radié. Contactez la mairie pour plus d'informations.",
  },
};

/** Statut de la fiche du chauffeur : libellé, couleur, icône et explication. */
export function statutDuChauffeur(fiche: Chauffeur) {
  const cle = fiche.statut ?? "en_attente_verification";
  return { ...STATUTS_CHAUFFEUR[cle], ...EXPLICATIONS[cle] };
}
