import {
  Car,
  ClipboardCheck,
  Contact,
  Home,
  ScrollText,
  Settings2,
  Siren,
  SlidersHorizontal,
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
  /** Autres modules gérés dans la même page ; l'un d'eux suffit à l'ouvrir. */
  sousModules?: string[];
  /** `configuration` : lien rangé à part, en bas du menu. */
  section?: "configuration";
};

/** Tous les modules de permission d'un lien. */
export const modulesDuLien = (l: NavLink) => (l.module ? [l.module, ...(l.sousModules ?? [])] : []);

export type Espace = {
  id: "gestion" | "administration" | "proprietaire";
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
    },
    links: [
      { href: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
      {
        href: "/admin/proprietaires",
        label: "Propriétaires",
        icon: UserRound,
        module: "proprietaires",
      },
      { href: "/admin/chauffeurs", label: "Chauffeurs", icon: Contact, module: "chauffeurs" },
      { href: "/admin/vehicules", label: "Véhicules", icon: Car, module: "vehicules" },
      { href: "/admin/controles", label: "Contrôles", icon: ClipboardCheck, module: "controles" },
      {
        href: "/admin/configuration",
        label: "Configuration",
        icon: SlidersHorizontal,
        module: "types_documents",
        sousModules: [
          "types_documents_sous_types",
          "types_vehicules",
          "categories_vehicules",
          "types_chauffeurs",
        ],
        section: "configuration",
      },
    ],
  },
  {
    id: "administration",
    titre: "Administration",
    description: "Comptes utilisateurs, rôles et permissions, informations de la mairie.",
    icon: Settings2,
    couleur: {
      tuile: "bg-primary text-accent",
      douce: "bg-primary/10 text-primary",
      texte: "text-primary",
      survol: "hover:border-primary",
    },
    links: [
      { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users, module: "users" },
      { href: "/admin/roles", label: "Rôles", icon: ShieldCheck, module: "roles" },
      {
        href: "/admin/unites-controle",
        label: "Unités de contrôle",
        icon: Siren,
        module: "unites",
        sousModules: ["categories"],
      },
      {
        href: "/admin/parametres",
        label: "Infos mairie",
        icon: Settings,
        module: "communes",
        sousModules: ["identifiants"],
      },
      { href: "/admin/journal", label: "Journal d'activité", icon: ScrollText, module: "journal" },
    ],
  },
];

/**
 * Espace propriétaire (/proprietaire/espace) : hors de l'administration, ses modules
 * ne sont accordés qu'au rôle `proprietaire` (page Rôles).
 */
export const ESPACE_PROPRIETAIRE: Espace = {
  id: "proprietaire",
  titre: "Espace propriétaire",
  description: "Ce que le propriétaire gère lui-même depuis son espace.",
  icon: Home,
  couleur: {
    tuile: "bg-accent text-on-accent",
    douce: "bg-accent/20 text-text-main",
    texte: "text-text-main",
    survol: "hover:border-accent",
  },
  links: [
    {
      href: "/proprietaire/espace/chauffeurs",
      label: "Mes chauffeurs",
      icon: Contact,
      module: "mes_chauffeurs",
    },
    {
      href: "/proprietaire/espace/vehicules",
      label: "Mes véhicules",
      icon: Car,
      module: "mes_vehicules",
    },
  ],
};

export function peutVoir(user: SessionUser | null, module: string) {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  return user.permissions?.[module]?.voir === true;
}

/** Espaces accessibles, avec seulement les liens autorisés. */
export function espacesDe(user: SessionUser | null): Espace[] {
  const lienVisible = (l: NavLink) => modulesDuLien(l).some((m) => peutVoir(user, m));
  return ESPACES.map((espace) => {
    if (!espace.links.some(lienVisible)) return null;
    return { ...espace, links: espace.links.filter((l) => !l.module || lienVisible(l)) };
  }).filter((e): e is Espace => e !== null);
}

/** Modules de permission d'un espace, dans l'ordre du menu. */
export const modulesDeLEspace = (espace: Espace) => espace.links.flatMap(modulesDuLien);

/** Espaces ouverts par un jeu de permissions (au moins un module de l'espace en `voir`). */
export function espacesDesPermissions(permissions: Permissions | undefined) {
  return ESPACES.filter((e) => modulesDeLEspace(e).some((m) => permissions?.[m]?.voir));
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
