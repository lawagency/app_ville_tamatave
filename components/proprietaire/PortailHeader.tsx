import Link from "next/link";
import type { ReactNode } from "react";

/** En-tête de la plateforme propriétaire : marque à gauche, actions à droite. */
export default function PortailHeader({ actions }: { actions?: ReactNode }) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-6">
        <Link href="/proprietaire" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-primary font-extrabold text-accent">
            VT
          </span>
          <span className="leading-tight">
            <span className="block font-bold text-primary">Ville de Toamasina</span>
            <span className="block text-xs text-text-muted">Espace propriétaire</span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-3">{actions}</div>
      </div>
    </header>
  );
}
