"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Car,
  FileCheck2,
  LayoutDashboard,
  LogOut,
  QrCode,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useAuthStore, useMaFicheStore } from "@/stores";

type Lien = { href: string; label: string; icon: LucideIcon; bientot?: boolean };

const LIENS: Lien[] = [
  { href: "/proprietaire/espace", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/proprietaire/espace/profil", label: "Mon profil", icon: UserRound },
  { href: "#vehicules", label: "Mes véhicules", icon: Car, bientot: true },
  { href: "#documents", label: "Mes documents", icon: FileCheck2, bientot: true },
  { href: "#controles", label: "Mes contrôles", icon: QrCode, bientot: true },
];

/** Menu latéral de l'espace propriétaire. */
export default function EspaceSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    useAuthStore.getState().logout();
    useMaFicheStore.getState().vider();
    router.replace("/proprietaire");
  }

  return (
    <div className="flex h-full flex-col">
      <Link
        href="/proprietaire"
        // Même hauteur que la barre du haut (h-16)
        className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-5"
      >
        <span className="flex size-9 items-center justify-center rounded-md bg-primary font-extrabold text-accent">
          VT
        </span>
        <span className="leading-tight">
          <span className="block text-lg font-extrabold tracking-wide text-primary">TOAMASINA</span>
          <span className="block text-xs font-semibold text-secondary">Espace propriétaire</span>
        </span>
      </Link>

      <nav className="flex-1 px-3 py-3">
        {LIENS.map(({ href, label, icon: Icon, bientot }) => (
          <div key={href} className="nav-item">
            {bientot ? (
              <span
                className="flex cursor-not-allowed items-center gap-2.5 rounded-md px-3 py-2.5 text-text-muted/60"
                title="Bientôt disponible"
              >
                <Icon className="size-5 shrink-0" strokeWidth={1.8} />
                <span className="flex-1 whitespace-nowrap">{label}</span>
                <span className="shrink-0 rounded-sm bg-background px-1 py-0.5 text-[10px] font-semibold uppercase">
                  Bientôt
                </span>
              </span>
            ) : (
              <Link
                href={href}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 font-medium transition-colors ${
                  pathname === href
                    ? "bg-primary text-white"
                    : "text-text-muted hover:bg-background hover:text-primary"
                }`}
              >
                <Icon className="size-5 shrink-0" strokeWidth={1.8} />
                {label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4">
        <button
          onClick={logout}
          className="btn-primary flex w-full items-center justify-center gap-2 py-3"
        >
          <LogOut className="size-4" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}
