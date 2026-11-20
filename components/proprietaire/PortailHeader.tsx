import Link from "next/link";
import type { ReactNode } from "react";
import { PORTAIL_PROPRIETAIRE, type Portail } from "@/components/portail/portails";
import ThemeToggle from "@/components/ThemeToggle";

/** En-tête d'une plateforme publique : marque à gauche, actions à droite. */
export default function PortailHeader({
  actions,
  portail = PORTAIL_PROPRIETAIRE,
}: {
  actions?: ReactNode;
  portail?: Portail;
}) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-6">
        <Link href={portail.base} className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-primary font-extrabold text-accent">
            VT
          </span>
          <span className="leading-tight">
            <span className="block font-bold text-primary">Ville de Toamasina</span>
            <span className="block text-xs text-text-muted">{portail.libelle}</span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          {actions}
        </div>
      </div>
    </header>
  );
}
