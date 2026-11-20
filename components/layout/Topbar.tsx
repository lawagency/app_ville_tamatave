"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Maximize, Menu, Minimize, Search } from "lucide-react";
import { useAuthStore, useControlesStore, useProprietairesStore, useUiStore } from "@/stores";
import { peutVoir } from "@/lib/espaces";
import ThemeToggle from "@/components/ThemeToggle";
import SearchBar from "./SearchBar";
import { useAlertes } from "./useAlertes";

function subscribeFullscreen(callback: () => void) {
  document.addEventListener("fullscreenchange", callback);
  return () => document.removeEventListener("fullscreenchange", callback);
}

function useFullscreen() {
  return useSyncExternalStore(
    subscribeFullscreen,
    () => document.fullscreenElement !== null,
    () => false,
  );
}

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen();
}

function UserMenu() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);

  const initiales = user ? `${user.prenom[0] ?? ""}${user.nom[0] ?? ""}`.toUpperCase() : "?";

  function logout() {
    useAuthStore.getState().logout();
    router.replace("/admin");
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-accent">
          {initiales}
        </span>
        <ChevronDown className="size-4 text-text-muted" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="card absolute right-0 top-full z-40 mt-2 w-56 p-0 shadow-lg">
            {user && (
              <div className="border-b border-border px-4 py-3">
                <p className="font-semibold">
                  {user.prenom} {user.nom}
                </p>
                <p className="text-sm text-text-muted">{user.role}</p>
              </div>
            )}
            <button onClick={logout} className="search-result text-danger">
              <LogOut className="size-4" />
              Déconnexion
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function Topbar() {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const setNotificationsOpen = useUiStore((s) => s.setNotificationsOpen);
  const fullscreen = useFullscreen();
  const [searching, setSearching] = useState(false);
  const { recentes } = useAlertes();
  const user = useAuthStore((s) => s.user);
  const voitControles = peutVoir(user, "controles");
  const voitProprietaires = peutVoir(user, "proprietaires");

  // Données utilisées par les notifications et la recherche globale
  useEffect(() => {
    if (voitControles) useControlesStore.getState().fetchAll();
    if (voitProprietaires) useProprietairesStore.getState().fetchAll();
  }, [voitControles, voitProprietaires]);

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center border-b border-border bg-surface px-6">
      {searching ? (
        <SearchBar onClose={() => setSearching(false)} />
      ) : (
        <>
          <div className="flex items-center gap-2">
            <button onClick={toggleSidebar} className="icon-btn" aria-label="Réduire le menu">
              <Menu className="size-5" />
            </button>
            <button onClick={toggleFullscreen} className="icon-btn" aria-label="Plein écran">
              {fullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
            </button>
            <button onClick={() => setSearching(true)} className="icon-btn" aria-label="Rechercher">
              <Search className="size-5" />
            </button>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <ThemeToggle />
            {voitControles && (
              <button
                onClick={() => setNotificationsOpen(true)}
                className="icon-btn relative"
                aria-label="Notifications"
              >
                <Bell className="size-5" />
                {recentes.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                    {recentes.length}
                  </span>
                )}
              </button>
            )}
            <UserMenu />
          </div>
        </>
      )}
    </header>
  );
}
