"use client";

import Link from "next/link";
import { Clock, OctagonAlert, X } from "lucide-react";
import { formatRelative } from "@/lib/api";
import { useUiStore } from "@/stores";
import type { Controle } from "@/types";
import { useAlertes } from "./useAlertes";

function AlerteItem({ controle, recente }: { controle: Controle; recente: boolean }) {
  const nonAutorise = controle.resultat === "non_autorise";
  const Icon = nonAutorise ? OctagonAlert : Clock;

  return (
    <li className="flex items-center gap-3 border-b border-border px-5 py-4">
      <div
        className={`flex size-11 shrink-0 items-center justify-center rounded-full ${
          nonAutorise ? "bg-danger/10 text-danger" : "bg-accent/15 text-accent"
        }`}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm ${recente ? "font-semibold" : "text-text-muted"}`}>
          {controle.immatriculation ?? `Contrôle n°${controle.id}`}
        </p>
        <p className="truncate text-sm text-text-muted">
          {nonAutorise ? "Non autorisé" : "À renouveler"}
          {controle.chauffeur_nom && ` · ${controle.chauffeur_nom}`}
        </p>
      </div>
      <span className={`text-xs ${recente ? "font-semibold" : "text-text-muted"}`}>
        {formatRelative(controle.date_controle)}
      </span>
    </li>
  );
}

export default function NotificationsPanel() {
  const open = useUiStore((s) => s.notificationsOpen);
  const setOpen = useUiStore((s) => s.setNotificationsOpen);
  const { recentes, anciennes } = useAlertes();

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-text-main/20 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-screen w-80 flex-col border-l border-border bg-surface shadow-xl transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
          <p className="text-sm font-bold uppercase tracking-wider">Notifications</p>
          <button onClick={() => setOpen(false)} className="icon-btn" aria-label="Fermer">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {recentes.length + anciennes.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-text-muted">Aucune alerte</p>
          )}

          {recentes.length > 0 && (
            <>
              <p className="panel-section">Récentes</p>
              <ul>
                {recentes.map((c) => (
                  <AlerteItem key={c.id} controle={c} recente />
                ))}
              </ul>
            </>
          )}

          {anciennes.length > 0 && (
            <>
              <p className="panel-section">Plus anciennes</p>
              <ul>
                {anciennes.slice(0, 20).map((c) => (
                  <AlerteItem key={c.id} controle={c} recente={false} />
                ))}
              </ul>
            </>
          )}
        </div>

        <Link
          href="/admin/controles"
          onClick={() => setOpen(false)}
          className="border-t border-border py-4 text-center text-sm font-semibold text-primary hover:bg-background"
        >
          Voir tous les contrôles
        </Link>
      </aside>
    </>
  );
}
