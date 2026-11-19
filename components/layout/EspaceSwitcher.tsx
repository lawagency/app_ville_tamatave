"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronsUpDown, LayoutGrid } from "lucide-react";
import type { Espace } from "@/lib/espaces";
import { accueilDe } from "@/lib/espaces";

type EspaceSwitcherProps = {
  courant?: Espace;
  espaces: Espace[];
  collapsed: boolean;
};

/** En-tête du menu latéral : espace courant, cliquable pour changer d'espace. */
export default function EspaceSwitcher({ courant, espaces, collapsed }: EspaceSwitcherProps) {
  const [open, setOpen] = useState(false);
  const plusieurs = espaces.length > 1;
  const Icon = courant?.icon;

  const etiquette = (
    <>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white/15 text-accent">
        {Icon ? <Icon className="size-5" /> : <span className="font-extrabold">VT</span>}
      </span>
      {!collapsed && (
        <span className="min-w-0 flex-1 text-left leading-tight">
          <span className="block text-xs font-semibold uppercase tracking-wider text-white/60">
            Toamasina
          </span>
          <span className="block truncate font-bold">
            {courant?.titre ?? "Suivi de la circulation"}
          </span>
        </span>
      )}
    </>
  );

  return (
    <div className="relative shrink-0 bg-primary p-3 text-white">
      {plusieurs ? (
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          title={collapsed ? "Changer d'espace" : undefined}
          className={`flex w-full items-center gap-3 rounded-md p-1.5 transition-colors hover:bg-white/10 ${
            open ? "bg-white/10" : ""
          } ${collapsed ? "justify-center" : ""}`}
        >
          {etiquette}
          {!collapsed && <ChevronsUpDown className="size-4 shrink-0 text-white/60" />}
        </button>
      ) : (
        <div className={`flex items-center gap-3 p-1.5 ${collapsed ? "justify-center" : ""}`}>
          {etiquette}
        </div>
      )}

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className={`absolute z-40 w-60 rounded-md border border-border bg-surface p-2 text-text-main shadow-lg ${
              collapsed ? "left-full top-3 ml-2" : "inset-x-3 top-full mt-1 w-auto"
            }`}
          >
            <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-wider text-text-muted">
              Espaces
            </p>
            {espaces.map((espace) => {
              const EspaceIcon = espace.icon;
              const actif = espace.id === courant?.id;
              return (
                <Link
                  key={espace.id}
                  href={accueilDe(espace)}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-background ${
                    actif ? "bg-background font-semibold" : ""
                  }`}
                >
                  <EspaceIcon className="size-5 text-text-muted" />
                  <span className="flex-1">{espace.titre}</span>
                  {actif && <Check className="size-4 text-primary" />}
                </Link>
              );
            })}
            <div className="my-2 border-t border-border" />
            <Link
              href="/admin/espaces"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-background"
            >
              <LayoutGrid className="size-5 text-text-muted" />
              Tous les espaces
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
