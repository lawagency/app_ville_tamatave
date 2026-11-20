"use client";

import { Fragment, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { SkeletonRows } from "../Skeleton";
import Pagination from "./Pagination";

export type Column<T> = {
  label: string;
  render: (row: T) => ReactNode;
  /** Colonne alignée à droite (montants, actions). */
  align?: "right";
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows?: T[];
  loading?: boolean;
  error?: string;
  title?: string;
  /** Barre d'outils (onglets, recherche, filtres) en haut de la carte du tableau. */
  toolbar?: ReactNode;
  pageSize?: number;
  /** Contenu affiché sous la ligne cliquée. Un second clic referme. */
  renderDetails?: (row: T) => ReactNode;
  /** Clic sur la ligne (ouvrir la fiche…), quand il n'y a pas de détails dépliables. */
  onRowClick?: (row: T) => void;
  /** Classe en plus sur la ligne (couleur selon le type…). */
  rowClassName?: (row: T) => string;
};

export default function DataTable<T extends { id: number }>({
  columns,
  rows = [],
  loading,
  error,
  title,
  toolbar,
  pageSize = 10,
  renderDetails,
  onRowClick,
  rowClassName,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<number | null>(null);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  // Si un filtre réduit la liste, on reste sur une page qui existe
  const current = Math.min(page, pageCount);
  const debut = (current - 1) * pageSize;
  const visibles = rows.slice(debut, debut + pageSize);
  const colSpan = columns.length + (renderDetails ? 1 : 0);

  function toggle(id: number) {
    setOpenId((actuel) => (actuel === id ? null : id));
  }

  return (
    <div className="card overflow-hidden p-0">
      {title && <h2 className="card-title px-6 pt-6 pb-4">{title}</h2>}
      {toolbar && <div className="px-6 py-4">{toolbar}</div>}

      {error ? (
        <p className="alert-error m-6">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.label} className={c.align === "right" ? "text-right" : undefined}>
                    {c.label}
                  </th>
                ))}
                {renderDetails && <th className="w-12" />}
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 && (
                <SkeletonRows colonnes={colSpan} lignes={Math.min(pageSize, 5)} />
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={colSpan} className="text-center text-text-muted">
                    Aucune donnée
                  </td>
                </tr>
              )}
              {visibles.map((row) => {
                const open = openId === row.id;
                const onClick = renderDetails
                  ? () => toggle(row.id)
                  : onRowClick
                    ? () => onRowClick(row)
                    : undefined;
                return (
                  <Fragment key={row.id}>
                    <tr
                      onClick={onClick}
                      aria-expanded={renderDetails ? open : undefined}
                      className={`${onClick ? "cursor-pointer" : ""} ${open ? "row-selected" : ""} ${rowClassName?.(row) ?? ""}`}
                    >
                      {columns.map((c) => (
                        <td
                          key={c.label}
                          className={c.align === "right" ? "text-right" : undefined}
                        >
                          {c.render(row)}
                        </td>
                      ))}
                      {renderDetails && (
                        <td className="text-text-muted">
                          <ChevronDown
                            className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
                          />
                        </td>
                      )}
                    </tr>
                    {renderDetails && open && (
                      <tr className="row-details">
                        <td colSpan={colSpan}>{renderDetails(row)}</td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!error && rows.length > pageSize && (
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
          <p className="text-sm text-text-muted">
            {debut + 1}–{Math.min(debut + pageSize, rows.length)} sur {rows.length}
          </p>
          <Pagination page={current} pageCount={pageCount} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
