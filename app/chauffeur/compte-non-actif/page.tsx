"use client";

import CompteNonActif from "@/components/portail/CompteNonActif";
import { PORTAIL_CHAUFFEUR } from "@/components/portail/portails";

/** Page affichée quand la connexion est refusée parce que le compte n'est pas actif. */
export default function CompteNonActifChauffeurPage() {
  return <CompteNonActif portail={PORTAIL_CHAUFFEUR} />;
}
