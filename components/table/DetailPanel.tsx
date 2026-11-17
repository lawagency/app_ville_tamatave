import type { ReactNode } from "react";

export type DetailItem = {
  label: string;
  value: ReactNode;
};

type DetailPanelProps = {
  title?: string;
  items?: DetailItem[];
  children?: ReactNode;
};

/** Contenu du panneau de détails sous une ligne de tableau. */
export default function DetailPanel({ title, items = [], children }: DetailPanelProps) {
  return (
    <div className="space-y-5 whitespace-normal px-2 py-2">
      {title && <p className="card-title">{title}</p>}
      {items.length > 0 && (
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.label}>
              <dt className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                {item.label}
              </dt>
              <dd className="mt-1 text-sm text-text-main">{item.value || "—"}</dd>
            </div>
          ))}
        </dl>
      )}
      {children}
    </div>
  );
}
