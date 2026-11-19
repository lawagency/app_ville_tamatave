import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { accueilDe, type Espace } from "@/lib/espaces";

/** Carte d'espace sobre : icône, titre, description, lien « Entrer ». */
export default function EspaceCard({ espace, recent }: { espace: Espace; recent: boolean }) {
  const Icon = espace.icon;

  return (
    <Link
      href={accueilDe(espace)}
      className={`group relative flex flex-col rounded-md border bg-white/5 p-7 transition-colors hover:border-white hover:bg-white/10 ${
        recent ? "border-white" : "border-white/20"
      }`}
    >
      {recent && (
        <span className="absolute right-6 top-6 rounded-md bg-surface px-2.5 py-1 text-xs font-semibold text-primary">
          Dernier utilisé
        </span>
      )}

      <span className="flex size-14 items-center justify-center rounded-md bg-surface text-primary">
        <Icon className="size-6" strokeWidth={1.8} />
      </span>

      <h2 className="mt-6 text-xl font-bold text-white">{espace.titre}</h2>
      <p className="mt-1 flex-1 text-sm text-white/70">{espace.description}</p>

      <span className="mt-6 inline-flex items-center gap-2 font-semibold text-white">
        Entrer
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
