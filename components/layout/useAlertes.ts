import { useState } from "react";
import { useControlesStore } from "@/stores";
import type { Controle } from "@/types";

const RESULTATS_ALERTE: Controle["resultat"][] = ["non_autorise", "a_renouveler"];
const UN_JOUR = 86_400_000;

/** Les notifications sont les contrôles à traiter : non autorisés ou à renouveler. */
export function useAlertes() {
  const controles = useControlesStore((s) => s.items);
  const [maintenant] = useState(() => Date.now());

  const alertes = controles
    .filter((c) => RESULTATS_ALERTE.includes(c.resultat))
    .sort((a, b) => b.date_controle.localeCompare(a.date_controle));

  const limite = maintenant - UN_JOUR;
  const recentes = alertes.filter((c) => new Date(c.date_controle).getTime() >= limite);
  const anciennes = alertes.filter((c) => new Date(c.date_controle).getTime() < limite);

  return { recentes, anciennes };
}
