import { ShieldCheck } from "lucide-react";
import type { Role } from "@/types";

/** Couleurs des rôles, toutes issues du thème. Attribuées dans l'ordre des rôles (par id). */
const COULEURS = [
  "bg-secondary/15 text-secondary border-secondary/30",
  "bg-accent/20 text-text-main border-accent/50",
  "bg-danger/10 text-danger border-danger/30",
  "bg-primary/10 text-primary border-primary/30",
  "bg-text-muted/15 text-text-main border-text-muted/30",
  "bg-secondary text-white border-secondary",
  "bg-accent text-on-accent border-accent",
];

const SUPER_ADMIN = "bg-primary text-white border-primary";

/** Index stable du rôle : la couleur suit le rôle, pas sa position dans un filtre. */
export function couleurRole(role: Role, roles: Role[]) {
  if (role.code === "super_admin") return SUPER_ADMIN;
  const autres = roles.filter((r) => r.code !== "super_admin").sort((a, b) => a.id - b.id);
  const index = autres.findIndex((r) => r.id === role.id);
  return COULEURS[Math.max(0, index) % COULEURS.length];
}

export default function RoleBadge({ role, roles }: { role?: Role; roles: Role[] }) {
  if (!role) return <span className="text-text-muted">—</span>;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${couleurRole(role, roles)}`}
    >
      <ShieldCheck className="size-3.5" />
      {role.nom}
    </span>
  );
}
