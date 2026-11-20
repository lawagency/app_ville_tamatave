"use client";

import CompteNonActif from "@/components/portail/CompteNonActif";
import { PORTAIL_PROPRIETAIRE } from "@/components/portail/portails";

/** Page affichée quand la connexion est refusée parce que le compte n'est pas actif. */
export default function CompteNonActifPage() {
  return <CompteNonActif portail={PORTAIL_PROPRIETAIRE} />;
}
