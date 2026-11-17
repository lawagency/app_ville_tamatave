"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";
import { espaceDuChemin, useEspaces } from "@/lib/espaces";
import { useUiStore } from "@/stores";

/** Menu de l'espace courant uniquement. */
export default function Sidebar() {
  const pathname = usePathname();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const espaces = useEspaces();
  const espace = espaceDuChemin(espaces, pathname);

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex h-16 shrink-0 items-center bg-primary px-6 text-white">
        {collapsed ? (
          <span className="mx-auto text-lg font-extrabold text-accent">VT</span>
        ) : (
          <div className="leading-tight">
            <p className="text-lg font-extrabold tracking-wide">TOAMASINA</p>
            <p className="text-xs text-accent">Suivi de la circulation</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6">
        {espace && !collapsed && <p className="nav-section">{espace.titre}</p>}
        <div className="space-y-1">
          {espace?.links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`nav-link ${collapsed ? "justify-center" : ""} ${
                pathname.startsWith(href) ? "nav-link-active" : ""
              }`}
            >
              <Icon className="size-5 shrink-0" strokeWidth={1.8} />
              {!collapsed && <span>{label}</span>}
            </Link>
          ))}
        </div>
      </nav>

      {espaces.length > 1 && (
        <div className="border-t border-border p-3">
          <Link
            href="/admin/espaces"
            title={collapsed ? "Changer d'espace" : undefined}
            className={`nav-link ${collapsed ? "justify-center" : ""}`}
          >
            <ArrowLeftRight className="size-5 shrink-0" strokeWidth={1.8} />
            {!collapsed && <span>Changer d&apos;espace</span>}
          </Link>
        </div>
      )}
    </aside>
  );
}
