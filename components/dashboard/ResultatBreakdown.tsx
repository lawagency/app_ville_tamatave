import { CircleCheck, Clock, OctagonAlert, SearchCheck, type LucideIcon } from "lucide-react";
import { RESULTATS_CONTROLE, type Controle } from "@/types";

const STYLES: Record<Controle["resultat"], { icon: LucideIcon; text: string; bar: string }> = {
  autorise: { icon: CircleCheck, text: "text-secondary", bar: "bg-secondary" },
  a_renouveler: { icon: Clock, text: "text-accent", bar: "bg-accent" },
  non_autorise: { icon: OctagonAlert, text: "text-danger", bar: "bg-danger" },
  en_verification: { icon: SearchCheck, text: "text-text-muted", bar: "bg-text-muted" },
};

export default function ResultatBreakdown({ controles }: { controles: Controle[] }) {
  const total = controles.length;

  return (
    <ul className="space-y-5">
      {(Object.keys(RESULTATS_CONTROLE) as Controle["resultat"][]).map((key) => {
        const count = controles.filter((c) => c.resultat === key).length;
        const pct = total ? Math.round((count / total) * 100) : 0;
        const { icon: Icon, text, bar } = STYLES[key];

        return (
          <li key={key}>
            <div className="mb-2 flex items-center gap-2 text-sm">
              <Icon className={`size-4 ${text}`} />
              <span>{RESULTATS_CONTROLE[key].label}</span>
              <span className="ml-auto font-semibold">{count}</span>
              <span className="w-10 text-right text-text-muted">{pct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-sm bg-background">
              <div className={`h-full rounded-sm ${bar}`} style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
