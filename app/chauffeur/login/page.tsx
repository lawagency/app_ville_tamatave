"use client";

import ConnexionPortail from "@/components/portail/ConnexionPortail";
import { PORTAIL_CHAUFFEUR } from "@/components/portail/portails";

export default function ChauffeurLogin() {
  return <ConnexionPortail portail={PORTAIL_CHAUFFEUR} />;
}
