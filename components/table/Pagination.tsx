import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
};

/** Numéros à afficher : tous si peu de pages, sinon 1 … autour de la page courante … dernière. */
function pagesVisibles(page: number, pageCount: number): (number | "…")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);

  const debut = Math.max(2, page - 1);
  const fin = Math.min(pageCount - 1, page + 1);
  return [
    1,
    ...(debut > 2 ? ["…" as const] : []),
    ...Array.from({ length: fin - debut + 1 }, (_, i) => debut + i),
    ...(fin < pageCount - 1 ? ["…" as const] : []),
    pageCount,
  ];
}

export default function Pagination({ page, pageCount, onChange }: PaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <nav className="flex items-center gap-2" aria-label="Pagination">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="page-btn"
        aria-label="Page précédente"
      >
        <ChevronLeft className="size-4" />
      </button>

      {pagesVisibles(page, pageCount).map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-1 text-text-muted">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`page-btn ${p === page ? "page-btn-active" : ""}`}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === pageCount}
        className="page-btn"
        aria-label="Page suivante"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
