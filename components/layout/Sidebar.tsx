"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { espaceDuChemin, useEspaces, type NavLink } from "@/lib/espaces";
import { useUiStore } from "@/stores";
import EspaceSwitcher from "./EspaceSwitcher";

/** Menu de l'espace courant, avec le sélecteur d'espace en en-tête. */
export default function Sidebar() {
  const pathname = usePathname();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const espaces = useEspaces();
  const espace = espaceDuChemin(espaces, pathname);
  const liens = espace?.links ?? [];
  const principaux = liens.filter((l) => !l.section);
  const configuration = liens.filter((l) => l.section === "configuration");

  const lien = ({ href, label, icon: Icon }: NavLink) => (
    <div key={href} className="nav-item">
      <Link
        href={href}
        title={collapsed ? label : undefined}
        className={`nav-link ${collapsed ? "justify-center" : ""} ${
          pathname.startsWith(href) ? "nav-link-active" : ""
        }`}
      >
        <Icon className="size-5 shrink-0" strokeWidth={1.8} />
        {!collapsed && <span>{label}</span>}
      </Link>
    </div>
  );

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 ${
        collapsed ? "w-20" : "w-60"
      }`}
    >
      <EspaceSwitcher courant={espace} espaces={espaces} collapsed={collapsed} />

      <nav className="flex flex-1 flex-col overflow-y-auto px-3 py-3">
        {principaux.map(lien)}

        {/* Paramétrage de l'espace : à part, en bas du menu */}
        {configuration.length > 0 && (
          <div className="mt-auto border-t-2 border-border pt-4">
            {!collapsed && <p className="nav-section">Configuration</p>}
            {configuration.map(lien)}
          </div>
        )}
      </nav>
    </aside>
  );
}
