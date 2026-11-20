/** Thème choisi : clair, sombre, ou celui du système (par défaut). */
export type Theme = "clair" | "sombre" | "systeme";

export const CLE_THEME = "theme";

/**
 * Script exécuté avant le premier affichage (dans <head>) : pose la classe `dark`
 * sans attendre React, pour éviter un flash blanc au chargement en mode sombre.
 */
export const SCRIPT_THEME = `(function(){try{var t=localStorage.getItem("${CLE_THEME}");var d=t==="sombre"||(t!=="clair"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;

export function lireTheme(): Theme {
  try {
    const t = localStorage.getItem(CLE_THEME);
    return t === "clair" || t === "sombre" ? t : "systeme";
  } catch {
    return "systeme";
  }
}

const estSombre = (theme: Theme) =>
  theme === "sombre" ||
  (theme === "systeme" && window.matchMedia("(prefers-color-scheme: dark)").matches);

/** Applique et retient le thème. */
export function appliquerTheme(theme: Theme) {
  try {
    if (theme === "systeme") localStorage.removeItem(CLE_THEME);
    else localStorage.setItem(CLE_THEME, theme);
  } catch {
    // Stockage indisponible (navigation privée) : le thème vaut pour cette page
  }
  document.documentElement.classList.toggle("dark", estSombre(theme));
}
