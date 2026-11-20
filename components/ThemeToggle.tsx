"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { appliquerTheme, lireTheme, type Theme } from "@/lib/theme";

const SUIVANT: Record<Theme, Theme> = { systeme: "clair", clair: "sombre", sombre: "systeme" };

const AFFICHAGE = {
  clair: { icon: Sun, label: "Thème clair" },
  sombre: { icon: Moon, label: "Thème sombre" },
  systeme: { icon: Monitor, label: "Thème du système" },
};

/** Bouton qui fait passer le thème : système → clair → sombre. */
export default function ThemeToggle({ className = "icon-btn" }: { className?: string }) {
  // Lu après le montage : localStorage n'existe pas au rendu serveur
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- préférence du navigateur
    setTheme(lireTheme());
  }, []);

  // Thème du système : suit son changement en direct
  useEffect(() => {
    if (theme !== "systeme") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const suivre = () => appliquerTheme("systeme");
    media.addEventListener("change", suivre);
    return () => media.removeEventListener("change", suivre);
  }, [theme]);

  const actuel = theme ?? "systeme";
  const { icon: Icon, label } = AFFICHAGE[actuel];
  const prochain = AFFICHAGE[SUIVANT[actuel]].label.toLowerCase();

  return (
    <button
      type="button"
      onClick={() => {
        const t = SUIVANT[actuel];
        appliquerTheme(t);
        setTheme(t);
      }}
      className={className}
      aria-label={`${label} : passer au ${prochain}`}
      title={`${label} (cliquer : ${prochain})`}
    >
      <Icon className="size-5" />
    </button>
  );
}
