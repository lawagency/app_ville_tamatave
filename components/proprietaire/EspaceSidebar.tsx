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
        className="flex items-center gap-3 border-b border-border px-6 py-6"
      >
        <span className="flex size-11 items-center justify-center rounded-md bg-primary text-lg font-extrabold text-accent">
          VT
        </span>
        <span className="leading-tight">
          <span className="block text-lg font-extrabold tracking-wide text-primary">TOAMASINA</span>
          <span className="block text-xs font-semibold text-secondary">Espace propriétaire</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1 px-4 py-6">
        {LIENS.map(({ href, label, icon: Icon, bientot }) =>
          bientot ? (
            <span
              key={href}
              className="flex cursor-not-allowed items-center gap-3 rounded-md px-4 py-3 text-text-muted/60"
              title="Bientôt disponible"
            >
              <Icon className="size-5" strokeWidth={1.8} />
              <span className="flex-1">{label}</span>
              <span className="rounded-sm bg-background px-1.5 py-0.5 text-[10px] font-semibold uppercase">
                Bientôt
              </span>
            </span>
          ) : (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-md px-4 py-3 font-medium transition-colors ${
                pathname === href
                  ? "bg-primary text-white shadow-md"
                  : "text-text-muted hover:bg-background hover:text-primary"
              }`}
            >
              <Icon className="size-5" strokeWidth={1.8} />
              {label}
            </Link>
          ),
        )}
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
