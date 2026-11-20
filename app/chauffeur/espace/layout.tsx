"use client";

import { Car, FileCheck2, LayoutDashboard, QrCode, UserRound } from "lucide-react";
import EspaceShell, { type LienEspace } from "@/components/portail/EspaceShell";
import { PORTAIL_CHAUFFEUR } from "@/components/portail/portails";
import { useMaFicheChauffeurStore } from "@/stores";

const LIENS: LienEspace[] = [
  { href: "/chauffeur/espace", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/chauffeur/espace/profil", label: "Mon profil", icon: UserRound },
  { href: "/chauffeur/espace/vehicules", label: "Mes véhicules", icon: Car },
  { href: "#documents", label: "Mes documents", icon: FileCheck2, bientot: true },
  { href: "#controles", label: "Mes contrôles", icon: QrCode, bientot: true },
];

/** Espace du chauffeur connecté. */
export default function EspaceChauffeurLayout({ children }: { children: React.ReactNode }) {
  const fiche = useMaFicheChauffeurStore((s) => s.fiche);
  const charger = useMaFicheChauffeurStore((s) => s.charger);
  const vider = useMaFicheChauffeurStore((s) => s.vider);

  return (
    <EspaceShell
      portail={PORTAIL_CHAUFFEUR}
      liens={LIENS}
      fiche={fiche}
      charger={charger}
      vider={vider}
    >
      {children}
    </EspaceShell>
  );
}
