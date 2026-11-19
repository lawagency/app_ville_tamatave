import type { ParametreIdentifiant } from "@/types";

type Format = Pick<
  ParametreIdentifiant,
  "prefixe" | "suffixe" | "longueur_sequence" | "separateur" | "format_personnalise"
>;

export const JETONS = ["{PREFIXE}", "{SEQ}", "{ANNEE}", "{MOIS}", "{SUFFIXE}", "{SEP}"];

/** Même calcul que l'API (`ParametresIndentifiantsService.formater`), pour l'aperçu. */
export function formaterIdentifiant(p: Format, sequence: number, date: Date) {
  const seq = String(sequence).padStart(p.longueur_sequence || 1, "0");
  const sep = p.separateur ?? "";
  if (p.format_personnalise) {
    return p.format_personnalise
      .replaceAll("{PREFIXE}", p.prefixe ?? "")
      .replaceAll("{SUFFIXE}", p.suffixe ?? "")
      .replaceAll("{SEQ}", seq)
      .replaceAll("{ANNEE}", String(date.getFullYear()))
      .replaceAll("{MOIS}", String(date.getMonth() + 1).padStart(2, "0"))
      .replaceAll("{SEP}", sep);
  }
  return [p.prefixe, seq, p.suffixe].filter((x) => x).join(sep);
}
