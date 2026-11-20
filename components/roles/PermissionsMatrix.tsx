"use client";

import { ESPACES, modulesDeLEspace, type Espace } from "@/lib/espaces";
import { ACTIONS, MODULES, actionsDuModule, type Permissions } from "@/types";

type Module = keyof typeof MODULES;
type Action = keyof typeof ACTIONS;

/** Modules de chaque espace, d'après le menu. */
export const groupesDe = (espaces: Espace[]) =>
  espaces.map((espace) => ({
    espace,
    modules: modulesDeLEspace(espace).filter((m): m is Module => m in MODULES),
  }));

type PermissionsMatrixProps = {
  value: Permissions;
  onChange: (value: Permissions) => void;
  disabled?: boolean;
  /** Espaces affichés ; par défaut ceux de l'administration. */
  espaces?: Espace[];
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
export default function PermissionsMatrix({
  value,
  onChange,
  disabled,
  espaces = ESPACES,
}: PermissionsMatrixProps) {
  const GROUPES = groupesDe(espaces);
  // Colonnes : seules les actions qui existent dans au moins un module affiché
  const ACTIONS_LISTE = (Object.keys(ACTIONS) as Action[]).filter((a) =>
    GROUPES.some((g) => g.modules.some((m) => actionsDuModule(m).includes(a))),
  );
  const coche = (m: string, a: string) => value[m]?.[a] === true;
  const nbCoches = (modules: string[]) =>
    modules.reduce((n, m) => n + actionsDuModule(m).filter((a) => coche(m, a)).length, 0);

  // Seules les actions qui existent pour le module sont accordées (journal : « Voir »)
  function definir(modules: string[], actions: string[], checked: boolean) {
    const suite = { ...value };
    for (const m of modules) {
      const possibles = actions.filter((a) => (actionsDuModule(m) as string[]).includes(a));
      suite[m] = { ...suite[m], ...Object.fromEntries(possibles.map((a) => [a, checked])) };
    }
    onChange(suite);
  }

  return (
    <div className="space-y-4">
      {GROUPES.map(({ espace, modules }) => {
        const Icon = espace.icon;
        const total = modules.reduce((n, m) => n + actionsDuModule(m).length, 0);
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
                  const possibles = actionsDuModule(m);
                  const nb = possibles.filter((a) => coche(m, a)).length;
                  return (
                    <tr key={m}>
                      <td className="font-medium">
                        {MODULES[m]}
                        {possibles.length === 1 && possibles[0] === "voir" && (
                          <span className="ml-2 text-xs font-normal text-text-muted">
                            lecture seule
                          </span>
                        )}
                      </td>
                      {ACTIONS_LISTE.map((a) => (
                        <td key={a} className="text-center">
                          {possibles.includes(a) ? (
                            <Case
                              checked={coche(m, a)}
                              onChange={(checked) => definir([m], [a], checked)}
                              label={`${MODULES[m]} : ${ACTIONS[a]}`}
                              disabled={disabled}
                              className="accent-primary"
                            />
                          ) : (
                            <span
                              className="text-text-muted"
                              title="Action inexistante pour ce module"
                            >
                              —
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="text-center">
                        <Case
                          checked={nb === possibles.length}
                          partiel={nb > 0 && nb < possibles.length}
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
