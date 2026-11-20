"use client";

import { FileCheck2, LayoutDashboard, QrCode, UserRound } from "lucide-react";
import EspaceShell, { type LienEspace } from "@/components/portail/EspaceShell";
import { PORTAIL_PROPRIETAIRE } from "@/components/portail/portails";
import { ESPACE_PROPRIETAIRE } from "@/lib/espaces";
import { useMaFicheStore } from "@/stores";

const LIENS: LienEspace[] = [
  { href: "/proprietaire/espace", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/proprietaire/espace/profil", label: "Mon profil", icon: UserRound },
  // Modules accordés au rôle propriétaire dans la page Rôles (Mes chauffeurs, Mes véhicules)
  ...ESPACE_PROPRIETAIRE.links,
  { href: "#documents", label: "Mes documents", icon: FileCheck2, bientot: true },
  { href: "#controles", label: "Mes contrôles", icon: QrCode, bientot: true },
];

/** Espace du propriétaire connecté. */
export default function EspaceLayout({ children }: { children: React.ReactNode }) {
  const fiche = useMaFicheStore((s) => s.fiche);
  const charger = useMaFicheStore((s) => s.charger);
  const vider = useMaFicheStore((s) => s.vider);

  return (
    <EspaceShell
      portail={PORTAIL_PROPRIETAIRE}
      liens={LIENS}
      fiche={fiche}
      charger={charger}
      vider={vider}
    >
      {children}
    </EspaceShell>
  );
}
