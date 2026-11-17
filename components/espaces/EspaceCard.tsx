import Link from "next/link";
import { ArrowRight, History, LayoutGrid } from "lucide-react";
import { accueilDe, type Espace } from "@/lib/espaces";

/** Carte d'espace façon galerie : grande vignette illustrée, étiquette d'angle, infos et bouton. */
export default function EspaceCard({ espace, recent }: { espace: Espace; recent: boolean }) {
  const Icon = espace.icon;
  const { couleur } = espace;

  return (
    <Link
      href={accueilDe(espace)}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Vignette */}
      <div className={`relative h-52 overflow-hidden ${couleur.douce}`}>
        <div className="absolute left-5 top-1/2 flex -translate-y-1/2 flex-col gap-3">
          <span className="size-3 rounded-full bg-secondary" />
          <span className="size-3 rounded-full bg-accent" />
          <span className="size-3 rounded-full bg-primary" />
          <span className="size-3 rounded-full bg-accent" />
        </div>

        <div
          className={`absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-[6px] bg-size-[12px_12px] ${couleur.anneau} ${couleur.motif}`}
        />
        <span
          className={`absolute left-1/2 top-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110 ${couleur.tuile}`}
        >
          <Icon className="size-10" strokeWidth={1.6} />
        </span>

        <div className="absolute bottom-4 right-4 flex gap-1.5">
          {espace.links.map((l) => (
            <span key={l.href} className={`size-3.5 rounded-sm ${couleur.tuile}`} />
          ))}
        </div>

        {recent && (
          <span className="absolute right-0 top-4 inline-flex items-center gap-1.5 rounded-l-md bg-accent px-3 py-1 text-xs font-bold text-text-main shadow">
            <History className="size-3.5" />
            Dernier utilisé
          </span>
        )}
      </div>

      {/* Infos */}
      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-lg font-bold text-text-main">{espace.titre}</h2>
        <p className="mt-1 flex-1 text-sm text-text-muted">{espace.description}</p>

        <div className="mt-4 flex items-center gap-4 text-xs text-text-muted">
          <span className="inline-flex items-center gap-1.5">
            <LayoutGrid className="size-3.5" />
            {espace.links.length} modules
          </span>
          <span className="flex items-center gap-1.5">
            {espace.links.map(({ href, icon: LinkIcon, label }) => (
              <LinkIcon key={href} className="size-3.5" aria-label={label} />
            ))}
          </span>
        </div>

        <span
          className={`mt-5 inline-flex w-fit items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold shadow-sm ${couleur.tuile}`}
        >
          Entrer
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
