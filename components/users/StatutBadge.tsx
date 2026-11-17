import { Ban, CircleCheck, CircleMinus, CircleX, Clock, type LucideIcon } from "lucide-react";
import { STATUTS_USER, type StatutUser } from "@/types";

const ICONES: Record<StatutUser, LucideIcon> = {
  en_attente: Clock,
  actif: CircleCheck,
  inactif: CircleMinus,
  rejete: CircleX,
  suspendu: Ban,
};

const COULEURS = {
  warning: "bg-accent/20 text-text-main",
  success: "bg-secondary/15 text-secondary",
  muted: "bg-text-muted/15 text-text-muted",
  danger: "bg-danger/10 text-danger",
};

/** Badge du statut d'un compte : couleur + icône + libellé. */
export default function StatutBadge({ statut }: { statut: StatutUser }) {
  const info = STATUTS_USER[statut];
  if (!info) return <span className="text-text-muted">{statut}</span>;
  const Icon = ICONES[statut];

  return (
    <span
      title={info.description}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${COULEURS[info.tone]}`}
    >
      <Icon className="size-3.5" />
      {info.label}
    </span>
  );
}
