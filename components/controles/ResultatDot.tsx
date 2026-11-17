import { StatusDot } from "@/components/ui";
import { RESULTATS_CONTROLE, type Controle } from "@/types";

export default function ResultatDot({ resultat }: { resultat: Controle["resultat"] }) {
  const info = RESULTATS_CONTROLE[resultat];
  return <StatusDot tone={info?.tone ?? "muted"} label={info?.label ?? resultat} />;
}
