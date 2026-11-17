"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, LogOut } from "lucide-react";
import EspaceCard from "@/components/espaces/EspaceCard";
import { accueilDe, useEspaces } from "@/lib/espaces";
import { useAuthStore, useUiStore } from "@/stores";

/** Point d'entrée après la connexion : choix de l'espace de travail. */
export default function EspacesPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const dernierEspace = useUiStore((s) => s.dernierEspace);
  const espaces = useEspaces();
  const unSeulEspace = espaces.length === 1;

  useEffect(() => {
    if (unSeulEspace) router.replace(accueilDe(espaces[0]));
  }, [unSeulEspace, espaces, router]);

  function logout() {
    useAuthStore.getState().logout();
    router.replace("/admin");
  }

  if (unSeulEspace) return null;

  const initiales = user ? `${user.prenom[0] ?? ""}${user.nom[0] ?? ""}`.toUpperCase() : "?";

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-6">
          <span className="flex size-10 items-center justify-center rounded-md bg-primary font-extrabold text-accent">
            VT
          </span>
          <div className="leading-tight">
            <p className="font-bold text-primary">Ville de Toamasina</p>
            <p className="text-xs text-text-muted">Suivi de la circulation</p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-semibold">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-xs text-text-muted">{user?.role}</p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-accent">
              {initiales}
            </span>
            <button
              onClick={logout}
              title="Déconnexion"
              aria-label="Déconnexion"
              className="icon-btn"
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <div className="text-center">
          <h1 className="page-title text-3xl">Bonjour {user?.prenom}</h1>
          <p className="mt-2 text-text-muted">
            Choisissez l&apos;espace dans lequel vous souhaitez travailler.
          </p>
          <div className="mx-auto mt-4 h-1 w-12 rounded-sm bg-accent" />
        </div>

        {espaces.length === 0 ? (
          <p className="alert-error mx-auto mt-10 max-w-lg text-center">
            Votre rôle ne donne accès à aucun espace. Contactez un administrateur.
          </p>
        ) : (
          <div className="mx-auto mt-10 grid max-w-3xl gap-8 md:grid-cols-2">
            {espaces.map((espace) => (
              <EspaceCard key={espace.id} espace={espace} recent={espace.id === dernierEspace} />
            ))}
          </div>
        )}

        <p className="mt-10 flex items-center justify-center gap-2 text-xs text-text-muted">
          <ArrowLeftRight className="size-3.5" />
          Vous pourrez changer d&apos;espace à tout moment depuis la barre du haut.
        </p>
      </main>
    </div>
  );
}
