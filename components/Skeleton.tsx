/** Bloc gris animé affiché à la place d'un contenu en cours de chargement. */
export default function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden
      style={style}
      className={`animate-pulse rounded-md bg-border/70 ${className}`}
    />
  );
}

/** Lignes de tableau factices : avatar + deux lignes de texte, puis une barre par colonne. */
export function SkeletonRows({ colonnes, lignes = 5 }: { colonnes: number; lignes?: number }) {
  return (
    <>
      {Array.from({ length: lignes }, (_, i) => (
        <tr key={i} aria-hidden className="hover:bg-transparent">
          <td>
            <div className="flex items-center gap-4">
              <Skeleton className="size-11 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </td>
          {Array.from({ length: colonnes - 1 }, (_, j) => (
            <td key={j}>
              <Skeleton className={`h-3.5 ${j % 2 ? "w-16" : "w-24"}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
