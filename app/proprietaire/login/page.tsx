"use client";

import ConnexionPortail from "@/components/portail/ConnexionPortail";
import { PORTAIL_PROPRIETAIRE } from "@/components/portail/portails";

export default function ProprietaireLogin() {
  return <ConnexionPortail portail={PORTAIL_PROPRIETAIRE} />;
}
