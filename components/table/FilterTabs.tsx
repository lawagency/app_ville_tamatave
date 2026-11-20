import type { Tone } from "./cells";

export type FilterTab<K extends string> = {
  key: K;
  label: string;
  count?: number;
  tone: Tone;
};

type FilterTabsProps<K extends string> = {
  tabs: FilterTab<K>[];
  value: K;
  onChange: (key: K) => void;
};

/** Couleur de l'onglet actif et du compteur, selon le ton. */
const STYLES: Record<Tone, { active: string; count: string }> = {
  primary: { active: "bg-primary text-white", count: "bg-primary/10 text-primary" },
  success: { active: "bg-secondary text-white", count: "bg-secondary/15 text-secondary" },
  warning: { active: "bg-accent text-on-accent", count: "bg-accent/25 text-text-main" },
  danger: { active: "bg-danger text-white", count: "bg-danger/10 text-danger" },
  muted: { active: "bg-text-muted text-surface", count: "bg-border text-text-muted" },
};

/** Onglets de filtre avec compteur : un clic filtre la liste. */
export default function FilterTabs<K extends string>({
  tabs,
  value,
  onChange,
}: FilterTabsProps<K>) {
  return (
    <div
      className="flex flex-wrap gap-1 rounded-md border border-border bg-background p-1"
      role="tablist"
    >
      {tabs.map((tab) => {
        const active = tab.key === value;
        const style = STYLES[tab.tone];
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
              active
                ? `${style.active} shadow-sm`
                : "text-text-muted hover:bg-surface hover:text-text-main"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`min-w-6 rounded-sm px-1.5 py-0.5 text-center text-xs font-bold ${
                  active ? "bg-white/25" : style.count
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
