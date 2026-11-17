"use client";

import { ESPACES } from "@/lib/espaces";
import { ACTIONS, MODULES, type Permissions } from "@/types";

type Module = keyof typeof MODULES;
type Action = keyof typeof ACTIONS;

const ACTIONS_LISTE = Object.keys(ACTIONS) as Action[];

/** Modules de chaque espace, d'après le menu. */
const GROUPES = ESPACES.map((espace) => ({
  espace,
  modules: espace.links.map((l) => l.module).filter((m): m is Module => !!m && m in MODULES),
}));

type PermissionsMatrixProps = {
  value: Permissions;
  onChange: (value: Permissions) => void;
  disabled?: boolean;
};

/** Case à cocher qui peut afficher l'état « partiel ». */
function Case({
  checked,
  partiel = false,
  onChange,
  label,
  disabled,
  className = "",
}: {
  checked: boolean;
  partiel?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <input
      type="checkbox"
      ref={(el) => {
        if (el) el.indeterminate = partiel;
      }}
      disabled={disabled}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      aria-label={label}
      className={`size-4 cursor-pointer disabled:cursor-not-allowed ${className}`}
    />
  );
}

/**
 * Permissions groupées par espace.
 * Cocher un espace donne tous ses modules avec toutes les actions ; on décoche ensuite au détail.
 */
export default function PermissionsMatrix({ value, onChange, disabled }: PermissionsMatrixProps) {
  const coche = (m: string, a: string) => value[m]?.[a] === true;
  const nbCoches = (modules: string[]) =>
    modules.reduce((n, m) => n + ACTIONS_LISTE.filter((a) => coche(m, a)).length, 0);

  function definir(modules: string[], actions: string[], checked: boolean) {
    const suite = { ...value };
    for (const m of modules) {
      suite[m] = { ...suite[m], ...Object.fromEntries(actions.map((a) => [a, checked])) };
    }
    onChange(suite);
  }

  return (
    <div className="space-y-4">
      {GROUPES.map(({ espace, modules }) => {
        const Icon = espace.icon;
        const total = modules.length * ACTIONS_LISTE.length;
        const coches = nbCoches(modules);

        return (
          <div key={espace.id} className="overflow-hidden rounded-md border border-border">
            <label
              className={`flex cursor-pointer items-center gap-3 px-4 py-3 ${espace.couleur.douce}`}
            >
              <Case
                checked={coches === total}
                partiel={coches > 0 && coches < total}
                onChange={(checked) => definir(modules, ACTIONS_LISTE, checked)}
                label={`Espace ${espace.titre}`}
                disabled={disabled}
                className="accent-primary"
              />
              <span
                className={`flex size-8 items-center justify-center rounded-md ${espace.couleur.tuile}`}
              >
                <Icon className="size-4" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-bold text-text-main">{espace.titre}</span>
                <span className="block text-xs text-text-muted">
                  {coches === 0
                    ? "Aucun accès à cet espace"
                    : coches === total
                      ? "Accès complet"
                      : `${coches} / ${total} permissions`}
                </span>
              </span>
            </label>

            <table className="table-base">
              <thead>
                <tr>
                  <th>Module</th>
                  {ACTIONS_LISTE.map((a) => (
                    <th key={a} className="text-center">
                      {ACTIONS[a]}
                    </th>
                  ))}
                  <th className="text-center">Tout</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((m) => {
                  const nb = ACTIONS_LISTE.filter((a) => coche(m, a)).length;
                  return (
                    <tr key={m}>
                      <td className="font-medium">{MODULES[m]}</td>
                      {ACTIONS_LISTE.map((a) => (
                        <td key={a} className="text-center">
                          <Case
                            checked={coche(m, a)}
                            onChange={(checked) => definir([m], [a], checked)}
                            label={`${MODULES[m]} : ${ACTIONS[a]}`}
                            disabled={disabled}
                            className="accent-primary"
                          />
                        </td>
                      ))}
                      <td className="text-center">
                        <Case
                          checked={nb === ACTIONS_LISTE.length}
                          partiel={nb > 0 && nb < ACTIONS_LISTE.length}
                          onChange={(checked) => definir([m], ACTIONS_LISTE, checked)}
                          label={`${MODULES[m]} : tout`}
                          disabled={disabled}
                          className="accent-secondary"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
