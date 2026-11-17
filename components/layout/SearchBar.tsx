"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserRound, X } from "lucide-react";
import { useEspaces } from "@/lib/espaces";
import { useProprietairesStore, useUiStore } from "@/stores";

/** Barre de recherche qui remplace la topbar : pages autorisées et propriétaires. */
export default function SearchBar({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const espaces = useEspaces();
  const proprietaires = useProprietairesStore((s) => s.items);
  const setProprietaireSearch = useUiStore((s) => s.setProprietaireSearch);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const pages = q
    ? espaces.flatMap((e) => e.links).filter((p) => p.label.toLowerCase().includes(q))
    : [];
  const personnes = q
    ? proprietaires
        .filter((p) =>
          [p.nom, p.prenom, p.identifiant, p.cin].some((v) => v?.toLowerCase().includes(q)),
        )
        .slice(0, 5)
    : [];

  function go(href: string) {
    router.push(href);
    onClose();
  }

  function openProprietaire(identifiant: string) {
    setProprietaireSearch(identifiant);
    go("/admin/proprietaires");
  }

  return (
    <div className="relative flex h-full flex-1 items-center">
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        placeholder="Rechercher une page, un propriétaire, un CIN…"
        className="h-full flex-1 bg-transparent text-base outline-none placeholder:text-text-muted"
      />
      <button onClick={onClose} className="icon-btn" aria-label="Fermer la recherche">
        <X className="size-5" />
      </button>

      {q && (
        <div className="card absolute left-0 right-0 top-full z-30 mt-px p-2 shadow-lg">
          {pages.length + personnes.length === 0 && (
            <p className="px-3 py-2 text-sm text-text-muted">Aucun résultat</p>
          )}
          {pages.map(({ href, label, icon: Icon }) => (
            <button key={href} onClick={() => go(href)} className="search-result">
              <Icon className="size-4 text-text-muted" />
              {label}
            </button>
          ))}
          {personnes.map((p) => (
            <button
              key={p.id}
              onClick={() => openProprietaire(p.identifiant)}
              className="search-result"
            >
              <UserRound className="size-4 text-text-muted" />
              {p.prenom} {p.nom}
              <span className="ml-auto text-xs text-text-muted">{p.identifiant}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
