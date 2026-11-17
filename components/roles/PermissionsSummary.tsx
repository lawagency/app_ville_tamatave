import { ESPACES } from "@/lib/espaces";
import { ACTIONS, MODULES, type Permissions } from "@/types";

type Module = keyof typeof MODULES;
type Action = keyof typeof ACTIONS;

/** Lecture seule : par espace, puis par module, les actions accordées. */
export default function PermissionsSummary({ permissions }: { permissions: Permissions }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {ESPACES.map((espace) => {
        const Icon = espace.icon;
        const modules = espace.links
          .map((l) => l.module)
          .filter((m): m is Module => !!m && m in MODULES);
        const ouvert = modules.some((m) => permissions?.[m]?.voir);

        return (
          <div
            key={espace.id}
            className="overflow-hidden rounded-md border border-border bg-surface"
          >
            <div className={`flex items-center gap-2 px-3 py-2 ${espace.couleur.douce}`}>
              <Icon className="size-4" />
              <span className="flex-1 text-sm font-bold">{espace.titre}</span>
              {!ouvert && <span className="text-xs text-text-muted">Aucun accès</span>}
            </div>
            <ul className="divide-y divide-border">
              {modules.map((m) => {
                const accordees = (Object.keys(ACTIONS) as Action[]).filter(
                  (a) => permissions?.[m]?.[a] === true,
                );
                return (
                  <li key={m} className="flex flex-wrap items-center gap-2 px-3 py-2">
                    <span className="w-28 text-sm font-medium">{MODULES[m]}</span>
                    {accordees.length === 0 ? (
                      <span className="text-xs text-text-muted">—</span>
                    ) : (
                      accordees.map((a) => (
                        <span key={a} className="badge badge-primary">
                          {ACTIONS[a]}
                        </span>
                      ))
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
