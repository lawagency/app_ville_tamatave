"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import EspaceSidebar from "@/components/proprietaire/EspaceSidebar";
import { Avatar } from "@/components/ui";
import { fichierUrl } from "@/lib/api";
import { useAuthStore, useMaFicheStore } from "@/stores";

/** Espace du propriétaire connecté : menu latéral, barre du haut, fiche chargée une fois. */
export default function EspaceLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const fiche = useMaFicheStore((s) => s.fiche);
  const autorise = user?.role === "proprietaire";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !autorise) router.replace("/proprietaire/login");
  }, [hydrated, autorise, router]);

  useEffect(() => {
    if (autorise) useMaFicheStore.getState().charger();
  }, [autorise]);

  if (!hydrated || !autorise) return null;

  const nom = `${user.prenom} ${user.nom}`;

  return (
    <div className="flex min-h-screen flex-1 relative">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
        <EspaceSidebar />
      </aside>

      {/* Surcouche mobile : fond sombre + sidebar en drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface shadow-xl lg:hidden">
            {/* Le logo est déjà dans la sidebar : seul le bouton de fermeture est ajouté */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="icon-btn absolute right-3 top-3 z-10"
              aria-label="Fermer le menu"
            >
              <X className="size-5" />
            </button>
            <EspaceSidebar />
          </aside>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-20 items-center gap-4 px-6 lg:px-10">
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="icon-btn lg:hidden"
            aria-label="Menu"
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <div className="lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-md bg-primary font-extrabold text-accent">
              VT
            </span>
          </div>
          <Link
            href="/proprietaire/espace/profil"
            className="ml-auto flex items-center gap-3 rounded-md px-2 py-1 transition-colors hover:bg-surface"
          >
            <span className="hidden text-right leading-tight sm:block">
              <span className="block text-sm font-semibold">{nom}</span>
              <span className="block text-xs text-text-muted">
                {fiche?.identifiant ?? "Propriétaire"}
              </span>
            </span>
            <Avatar label={nom} photo={fichierUrl(fiche?.photo_chemin)} />
          </Link>
          <button
            onClick={() => {
              useAuthStore.getState().logout();
              useMaFicheStore.getState().vider();
              router.replace("/proprietaire");
            }}
            className="icon-btn lg:hidden"
            aria-label="Déconnexion"
          >
            <LogOut className="size-5" />
          </button>
        </header>
        <main className="flex-1 px-6 pb-10 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
