/** Formats d'écriture malgaches (CIN, téléphone). */

export const chiffres = (v: string) => v.replace(/\D/g, "");

/** Découpe une suite de chiffres selon des tailles de groupes : (« 0341234567 », [3,2,3,2]). */
function grouper(c: string, tailles: number[]) {
  const groupes: string[] = [];
  let i = 0;
  for (const t of tailles) {
    if (i >= c.length) break;
    groupes.push(c.slice(i, i + t));
    i += t;
  }
  return groupes.join(" ");
}

// CIN : 12 chiffres par groupes de 3 — 101 211 123 456
export const CIN_LONGUEUR = 12;

export function formaterCin(valeur?: string | null) {
  return grouper(chiffres(valeur ?? "").slice(0, CIN_LONGUEUR), [3, 3, 3, 3]);
}

export const cinValide = (valeur: string) => chiffres(valeur).length === CIN_LONGUEUR;

// Téléphone : 9 chiffres nationaux après l'indicatif 261
// local : 034 12 345 67 — international : +261 34 12 345 67
const INDICATIF = "261";

/** Les 9 chiffres nationaux, quel que soit le format saisi. */
function national(valeur: string) {
  const c = chiffres(valeur);
  if (c.startsWith(INDICATIF)) return c.slice(3, 12);
  if (c.startsWith("0")) return c.slice(1, 10);
  return c.slice(0, 9);
}

/** Mise en forme pendant la saisie, en gardant le style choisi (local ou international). */
export function formaterTelephone(valeur?: string | null) {
  const v = (valeur ?? "").trim();
  if (!v) return "";
  const n = national(v);
  if (v.startsWith("+") || chiffres(v).startsWith(INDICATIF)) {
    return `+${INDICATIF}${n ? " " : ""}${grouper(n, [2, 2, 3, 2])}`;
  }
  return grouper(`0${n}`, [3, 2, 3, 2]);
}

export const telephoneValide = (valeur: string) => national(valeur).length === 9;

/** Forme enregistrée en base : international compact, +261341234567. */
export function normaliserTelephone(valeur: string) {
  const n = national(valeur);
  return n ? `+${INDICATIF}${n}` : "";
}

/** Affichage dans les tableaux et fiches : 034 12 345 67. */
export function afficherTelephone(valeur?: string | null) {
  if (!valeur) return "";
  const n = national(valeur);
  return n.length === 9 ? grouper(`0${n}`, [3, 2, 3, 2]) : valeur;
}
