"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { espaceDuChemin, useEspaces } from "@/lib/espaces";
import { useUiStore } from "@/stores";
import EspaceSwitcher from "./EspaceSwitcher";

/** Menu de l'espace courant, avec le sélecteur d'espace en en-tête. */
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
      <EspaceSwitcher courant={espace} espaces={espaces} collapsed={collapsed} />

      <nav className="flex-1 overflow-y-auto px-3 py-6">
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
    </aside>
  );
}
