"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X, type LucideIcon } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Avatar } from "@/components/ui";
import { fichierUrl } from "@/lib/api";
import { peutVoir } from "@/lib/espaces";
import { useAuthStore } from "@/stores";
import type { Portail } from "./portails";

export type LienEspace = {
  href: string;
  label: string;
  icon: LucideIcon;
  bientot?: boolean;
  /** Module accordé au rôle (page Rôles) ; absent : toujours visible. */
  module?: string;
};

type Props = {
  portail: Portail;
  liens: LienEspace[];
  /** Fiche de l'utilisateur connecté, chargée par l'espace (identifiant et photo). */
  fiche: { identifiant: string; photo_chemin: string | null } | null;
  /** Charge la fiche une fois l'accès vérifié. */
  charger: () => void;
  /** Vide la fiche à la déconnexion. */
  vider: () => void;
  children: React.ReactNode;
};

/** Menu latéral d'un espace : logo, liens autorisés, déconnexion. */
function Sidebar({
  portail,
  liens,
  onLogout,
  onNavigate,
}: {
  portail: Portail;
  liens: LienEspace[];
  onLogout: () => void;
  /** Clic sur un lien : referme le menu mobile. */
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const accueil = `${portail.base}/espace`;
  const visibles = liens.filter((l) => !l.module || peutVoir(user, l.module));

  return (
    <div className="flex h-full flex-col">
      <Link
        href={portail.base}
        onClick={onNavigate}
        // Même hauteur que la barre du haut (h-16)
        className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-5"
      >
        <span className="flex size-9 items-center justify-center rounded-md bg-primary font-extrabold text-accent">
          VT
        </span>
        <span className="leading-tight">
          <span className="block text-lg font-extrabold tracking-wide text-primary">TOAMASINA</span>
          <span className="block text-xs font-semibold text-secondary">{portail.libelle}</span>
        </span>
      </Link>

      <nav className="flex-1 px-3 py-3">
        {visibles.map(({ href, label, icon: Icon, bientot }) => (
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
                onClick={onNavigate}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 font-medium transition-colors ${
                  // Le tableau de bord est la racine : seulement lui-même ; les autres incluent leurs fiches
                  (href === accueil ? pathname === href : pathname.startsWith(href))
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
          onClick={onLogout}
          className="btn-primary flex w-full items-center justify-center gap-2 py-3"
        >
          <LogOut className="size-4" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}

/**
 * Cadre d'un espace connecté (propriétaire, chauffeur) : accès réservé au rôle du portail,
 * menu latéral, barre du haut, fiche chargée une fois et permissions relues.
 */
export default function EspaceShell({ portail, liens, fiche, charger, vider, children }: Props) {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const autorise = user?.role === portail.role;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !autorise) router.replace(`${portail.base}/login`);
  }, [hydrated, autorise, router, portail.base]);

  useEffect(() => {
    if (!autorise) return;
    charger();
    // Les droits du rôle (page Rôles) peuvent avoir changé depuis la connexion
    useAuthStore.getState().rafraichir();
  }, [autorise, charger]);

  if (!hydrated || !autorise) return null;

  const nom = `${user.prenom} ${user.nom}`;

  function logout() {
    useAuthStore.getState().logout();
    vider();
    router.replace(portail.base);
  }

  const sidebar = (
    <Sidebar
      portail={portail}
      liens={liens}
      onLogout={logout}
      onNavigate={() => setSidebarOpen(false)}
    />
  );

  return (
    <div className="relative flex min-h-screen flex-1">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-surface lg:flex">
        {sidebar}
      </aside>

      {/* Surcouche mobile : fond sombre + sidebar en drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border bg-surface shadow-xl lg:hidden">
            {/* Le logo est déjà dans la sidebar : seul le bouton de fermeture est ajouté */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="icon-btn absolute right-3 top-3 z-10"
              aria-label="Fermer le menu"
            >
              <X className="size-5" />
            </button>
            {sidebar}
          </aside>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-border bg-surface px-6 lg:px-10">
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
          <ThemeToggle className="icon-btn ml-auto" />
          <Link
            href={`${portail.base}/espace/profil`}
            className="flex items-center gap-3 rounded-md px-2 py-1 transition-colors hover:bg-surface"
          >
            <span className="hidden text-right leading-tight sm:block">
              <span className="block text-sm font-semibold">{nom}</span>
              <span className="block text-xs capitalize text-text-muted">
                {fiche?.identifiant ?? portail.qui}
              </span>
            </span>
            <Avatar label={nom} photo={fichierUrl(fiche?.photo_chemin)} />
          </Link>
          <button onClick={logout} className="icon-btn lg:hidden" aria-label="Déconnexion">
            <LogOut className="size-5" />
          </button>
        </header>
        <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
