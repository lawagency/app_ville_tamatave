import {
  ClipboardCheck,
  Landmark,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  TrafficCone,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useAuthStore } from "@/stores";
import type { Permissions, SessionUser } from "@/types";

export type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Module de permission requis (`<module>.voir`). Absent : visible par tout l'espace. */
  module?: string;
};

export type Espace = {
  id: "gestion" | "administration";
  titre: string;
  description: string;
  icon: LucideIcon;
  /** Identité visuelle de l'espace, pour le reconnaître d'un coup d'œil. */
  couleur: {
    /** Pastille d'icône pleine. */
    tuile: string;
    /** Fond léger et texte coloré. */
    douce: string;
    /** Texte coloré. */
    texte: string;
    /** Bordure colorée au survol. */
    survol: string;
    /** Motif de points de la vignette. */
    motif: string;
    /** Anneau décoratif de la vignette. */
    anneau: string;
  };
  links: NavLink[];
};

export const ESPACES: Espace[] = [
  {
    id: "gestion",
    titre: "Gestion quotidienne",
    description: "Suivi des propriétaires, des véhicules et des contrôles sur le terrain.",
    icon: TrafficCone,
    couleur: {
      tuile: "bg-secondary text-white",
      douce: "bg-secondary/10 text-secondary",
      texte: "text-secondary",
      survol: "hover:border-secondary",
      motif: "bg-[radial-gradient(var(--color-secondary)_1.5px,transparent_1.5px)]",
      anneau: "border-accent",
    },
    links: [
      { href: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
      {
        href: "/admin/proprietaires",
        label: "Propriétaires",
        icon: UserRound,
        module: "proprietaires",
      },
      { href: "/admin/controles", label: "Contrôles", icon: ClipboardCheck, module: "controles" },
    ],
  },
  {
    id: "administration",
    titre: "Administration",
    description: "Comptes utilisateurs, rôles et permissions, informations de la mairie.",
    icon: Landmark,
    couleur: {
      tuile: "bg-primary text-accent",
      douce: "bg-primary/10 text-primary",
      texte: "text-primary",
      survol: "hover:border-primary",
      motif: "bg-[radial-gradient(var(--color-primary)_1.5px,transparent_1.5px)]",
      anneau: "border-secondary",
    },
    links: [
      { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users, module: "users" },
      { href: "/admin/roles", label: "Rôles", icon: ShieldCheck, module: "roles" },
      { href: "/admin/parametres", label: "Paramètres", icon: Settings, module: "communes" },
    ],
  },
];

export function peutVoir(user: SessionUser | null, module: string) {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  return user.permissions?.[module]?.voir === true;
}

/** Espaces accessibles, avec seulement les liens autorisés. */
export function espacesDe(user: SessionUser | null): Espace[] {
  return ESPACES.map((espace) => {
    const modules = espace.links.filter((l) => l.module);
    if (!modules.some((l) => peutVoir(user, l.module!))) return null;
    return { ...espace, links: espace.links.filter((l) => !l.module || peutVoir(user, l.module)) };
  }).filter((e): e is Espace => e !== null);
}

/** Espaces ouverts par un jeu de permissions (au moins un module de l'espace en `voir`). */
export function espacesDesPermissions(permissions: Permissions | undefined) {
  return ESPACES.filter((e) => e.links.some((l) => l.module && permissions?.[l.module]?.voir));
}

export function accueilDe(espace: Espace) {
  return espace.links[0].href;
}

export function espaceDuChemin(espaces: Espace[], pathname: string) {
  return espaces.find((e) => e.links.some((l) => pathname.startsWith(l.href)));
}

export function useEspaces() {
  const user = useAuthStore((s) => s.user);
  return espacesDe(user);
}
