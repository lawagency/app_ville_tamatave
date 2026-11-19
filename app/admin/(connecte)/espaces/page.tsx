"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
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

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-linear-to-br from-primary to-primary-hover text-white">
      <header className="flex items-center justify-between px-8 py-6 lg:px-12">
        <p className="font-bold uppercase tracking-[0.2em] text-white/70">Ville de Toamasina</p>
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-md bg-surface px-4 py-2 text-sm font-semibold text-primary transition-opacity hover:opacity-90"
        >
          <LogOut className="size-4" />
          Déconnexion
        </button>
      </header>

      <main className="flex flex-1 items-center px-8 pb-24 lg:px-12">
        <div className="mx-auto w-full max-w-5xl">
          <h1 className="text-4xl font-bold">Bonjour {user?.prenom}</h1>
          <p className="mt-2 text-white/70">
            Choisissez l&apos;espace dans lequel vous souhaitez travailler.
          </p>

          {espaces.length === 0 ? (
            <p className="mt-10 rounded-md border border-white/20 bg-white/5 p-4 text-sm">
              Votre rôle ne donne accès à aucun espace. Contactez un administrateur.
            </p>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {espaces.map((espace) => (
                <EspaceCard key={espace.id} espace={espace} recent={espace.id === dernierEspace} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
