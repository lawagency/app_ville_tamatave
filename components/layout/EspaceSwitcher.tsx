"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronsUpDown, LayoutGrid } from "lucide-react";
import { accueilDe, espaceDuChemin, useEspaces } from "@/lib/espaces";

/**
 * Espace courant, toujours visible dans la barre du haut.
 * S'il y en a plusieurs, un clic ouvre la liste des espaces et le lien vers la page des espaces.
 */
export default function EspaceSwitcher() {
  const pathname = usePathname();
  const espaces = useEspaces();
  const courant = espaceDuChemin(espaces, pathname);
  const [open, setOpen] = useState(false);

  if (!courant) return null;
  const Icon = courant.icon;
  const plusieurs = espaces.length > 1;

  const etiquette = (
    <>
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-md ${courant.couleur.tuile}`}
      >
        <Icon className="size-4" />
      </span>
      <span className="hidden text-left leading-tight sm:block">
        <span className="block text-xs text-text-muted">Espace</span>
        <span className="block text-sm font-semibold text-text-main">{courant.titre}</span>
      </span>
    </>
  );

  if (!plusieurs) return <div className="flex items-center gap-3 px-2">{etiquette}</div>;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`flex items-center gap-3 rounded-md border px-2 py-1.5 transition-colors hover:border-primary ${
          open ? "border-primary bg-primary/5" : "border-border"
        }`}
      >
        {etiquette}
        <ChevronsUpDown className="size-4 text-text-muted" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="absolute left-0 top-full z-40 mt-2 w-80 overflow-hidden rounded-md border border-border bg-surface shadow-lg"
          >
            <p className="panel-section pt-4">Changer d&apos;espace</p>
            <div className="p-2 pt-0">
              {espaces.map((espace) => {
                const EspaceIcon = espace.icon;
                const actif = espace.id === courant.id;
                return (
                  <Link
                    key={espace.id}
                    href={accueilDe(espace)}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className={`flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-background ${
                      actif ? "bg-background" : ""
                    }`}
                  >
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-md ${espace.couleur.tuile}`}
                    >
                      <EspaceIcon className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{espace.titre}</span>
                      <span className="block text-xs text-text-muted">{espace.description}</span>
                    </span>
                    {actif && <Check className="mt-1 size-4 shrink-0 text-secondary" />}
                  </Link>
                );
              })}
            </div>
            <Link
              href="/admin/espaces"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 border-t border-border py-3 text-sm font-semibold text-primary hover:bg-background"
            >
              <LayoutGrid className="size-4" />
              Tous les espaces
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
