import {
  Building2,
  Car,
  ClipboardCheck,
  Contact,
  Hash,
  Layers3,
  LogIn,
  Settings2,
  ShieldCheck,
  Siren,
  Tags,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { formatDate } from "@/lib/api";
import { formaterCin, afficherTelephone } from "@/lib/formats";
import {
  ACTIONS,
  MODULES,
  STATUTS_CHAUFFEUR,
  STATUTS_FICHE,
  AUTORISATIONS_CIRCULATION,
  STATUTS_PROFESSIONNELS,
  STATUTS_VEHICULE,
  type AutorisationCirculation,
  type StatutVehicule,
  STATUTS_USER,
  type StatutProfessionnel,
  type JournalActivite,
} from "@/types";

export type TypeAction = "creation" | "modification" | "suppression" | "connexion";

export const TYPES_ACTION: Record<
  TypeAction,
  { label: string; tone: "success" | "primary" | "danger" | "muted" }
> = {
  creation: { label: "Création", tone: "success" },
  modification: { label: "Modification", tone: "primary" },
  suppression: { label: "Suppression", tone: "danger" },
  connexion: { label: "Connexion", tone: "muted" },
};

/** Ressources de l'API : article + nom, pour écrire « le propriétaire Jean RAKOTO ». */
const RESSOURCES: Record<string, { nom: string; icon: LucideIcon }> = {
  proprietaires: { nom: "le propriétaire", icon: UserRound },
  users: { nom: "l'utilisateur", icon: Users },
  roles: { nom: "le rôle", icon: ShieldCheck },
  communes: { nom: "les informations de la mairie", icon: Building2 },
  "unites-controle": { nom: "l'unité de contrôle", icon: Siren },
  "categories-services": { nom: "la catégorie de service", icon: Tags },
  "parametres-indentifiants": { nom: "le format d'identifiant", icon: Hash },
  controles: { nom: "le contrôle", icon: ClipboardCheck },
  chauffeurs: { nom: "le chauffeur", icon: Contact },
  "types-chauffeurs": { nom: "le type de chauffeur", icon: Contact },
  "types-vehicules": { nom: "le type de véhicule", icon: Car },
  "categories-vehicules": { nom: "la catégorie de véhicule", icon: Layers3 },
  vehicules: { nom: "le véhicule", icon: Car },
};

/** Nom lisible d'une ressource à partir de son id (listes déjà chargées), sinon `undefined`. */
export type NomDe = (ressource: string, id: number) => string | undefined;

export type Description = {
  type: TypeAction;
  /** Phrase courte : « A modifié le propriétaire Jean RAKOTO ». */
  titre: string;
  icon: LucideIcon;
  /** Ressource visée (`proprietaires`…) et son id, pour ouvrir sa fiche. */
  ressource?: string;
  ressourceId?: number;
};

/** « de » + article contracté : « du propriétaire », « des informations », « de l'utilisateur ». */
function de(groupe: string) {
  if (groupe.startsWith("le ")) return `du ${groupe.slice(3)}`;
  if (groupe.startsWith("les ")) return `des ${groupe.slice(4)}`;
  return `de ${groupe}`;
}

/** « Prénom NOM » pour une personne, sinon le nom seul (rôle, unité…). */
function nomComplet(d: Record<string, unknown>) {
  const prenom = typeof d.prenom === "string" ? d.prenom : "";
  const nom = typeof d.nom === "string" ? d.nom : "";
  return prenom ? `${prenom} ${nom.toUpperCase()}`.trim() : nom;
}

/** Traduit une ligne du journal (méthode + URL + données) en phrase compréhensible. */
export function decrire(e: JournalActivite, nomDe: NomDe): Description {
  const [ressource = "", idBrut, sous] = e.url.split("?")[0].replace(/^\/+/, "").split("/");
  const id = Number(idBrut);
  const aId = Number.isInteger(id) && id > 0;
  const d = e.donnees_envoyees ?? {};
  const type: TypeAction =
    e.methode === "POST" ? "creation" : e.methode === "DELETE" ? "suppression" : "modification";

  if (ressource === "auth") {
    return idBrut === "inscription"
      ? { type: "creation", titre: `Inscription du propriétaire ${nomComplet(d)}`, icon: UserRound }
      : { type: "connexion", titre: "Connexion", icon: LogIn };
  }

  const info = RESSOURCES[ressource] ?? { nom: ressource || "élément", icon: Settings2 };
  const base = { icon: info.icon, ressource, ressourceId: aId ? id : undefined };

  // Espace propriétaire : /chauffeurs/mes-chauffeurs[/:id[/photo]]
  if (ressource === "chauffeurs" && idBrut === "mes-chauffeurs") {
    const [, , , detail] = e.url.split("?")[0].replace(/^\/+/, "").split("/");
    const cId = Number(sous);
    const cible = cId ? `le chauffeur ${nomDe("chauffeurs", cId) ?? `n° ${cId}`}` : "le chauffeur";
    const avecFiche = { ...base, ressourceId: cId || undefined };
    if (e.methode === "POST" && !sous) {
      return { ...avecFiche, type: "creation", titre: `A ajouté le chauffeur ${nomComplet(d)}` };
    }
    if (e.methode === "DELETE") {
      return { ...avecFiche, type: "suppression", titre: `A retiré ${cible} de ses chauffeurs` };
    }
    if (detail === "photo") {
      return { ...avecFiche, type: "modification", titre: `A changé la photo ${de(cible)}` };
    }
    if (typeof d.statut_professionnel === "string" && Object.keys(d).length === 1) {
      const situation =
        STATUTS_PROFESSIONNELS[d.statut_professionnel as StatutProfessionnel]?.label ??
        d.statut_professionnel;
      return {
        ...avecFiche,
        type: "modification",
        titre: `A changé la situation ${de(cible)} : ${situation}`,
      };
    }
    return { ...avecFiche, type: "modification", titre: `A modifié ${cible}` };
  }

  // Véhicules : /vehicules[/mes-vehicules]/:id[/chauffeur|/proprietaire|/photo]
  if (ressource === "vehicules") {
    const proprietaire = idBrut === "mes-vehicules";
    const segments = e.url.split("?")[0].replace(/^\/+/, "").split("/");
    const vId = Number(proprietaire ? segments[2] : idBrut);
    const detail = proprietaire ? segments[3] : sous;
    const cible = vId ? `le véhicule ${nomDe("vehicules", vId) ?? `n° ${vId}`}` : "le véhicule";
    const avecFiche = { ...base, ressourceId: vId || undefined };
    const immat = typeof d.immatriculation === "string" ? ` ${d.immatriculation}` : "";

    if (e.methode === "POST" && !vId) {
      return { ...avecFiche, type: "creation", titre: `A enregistré le véhicule${immat}` };
    }
    if (detail === "chauffeur") {
      return {
        ...avecFiche,
        type: "modification",
        titre:
          e.methode === "DELETE"
            ? `A retiré le chauffeur ${de(cible)}`
            : `A attribué un chauffeur au ${cible.slice(3)}`,
      };
    }
    if (detail === "proprietaire") {
      return { ...avecFiche, type: "modification", titre: `A changé le propriétaire ${de(cible)}` };
    }
    if (detail === "photo") {
      return { ...avecFiche, type: "modification", titre: `A changé la photo ${de(cible)}` };
    }
    if (e.methode === "DELETE") return { ...avecFiche, type, titre: `A supprimé ${cible}` };
    if (typeof d.statut === "string") {
      const statut = STATUTS_VEHICULE[d.statut as StatutVehicule]?.label ?? d.statut;
      return { ...avecFiche, type, titre: `A changé le statut ${de(cible)} : ${statut}` };
    }
    if (typeof d.autorisation_circulation === "string" && Object.keys(d).length === 1) {
      const autorisation =
        AUTORISATIONS_CIRCULATION[d.autorisation_circulation as AutorisationCirculation]?.label ??
        d.autorisation_circulation;
      return {
        ...avecFiche,
        type,
        titre: `A changé l'autorisation de circuler ${de(cible)} : ${autorisation}`,
      };
    }
    return { ...avecFiche, type: "modification", titre: `A modifié ${cible}` };
  }

  if ((ressource === "proprietaires" || ressource === "chauffeurs") && idBrut === "moi") {
    return {
      ...base,
      type: "modification",
      titre:
        sous === "photo"
          ? "A changé sa photo de profil"
          : `A complété son profil ${ressource === "chauffeurs" ? "chauffeur" : "propriétaire"}`,
    };
  }

  const cible = `${info.nom}${aId ? ` ${nomDe(ressource, id) ?? `n° ${id}`}` : ""}`;

  if (sous === "photo")
    return { ...base, type: "modification", titre: `A changé la photo ${de(cible)}` };
  if (sous === "blacklist") {
    // Retrait de la liste noire en DELETE : c'est une modification de la fiche, pas une suppression
    return {
      ...base,
      type: "modification",
      titre:
        e.methode === "DELETE"
          ? `A retiré ${cible} de la liste noire`
          : `A mis ${cible} sur liste noire`,
    };
  }

  if (e.methode === "POST") {
    const nom = nomComplet(d);
    return { ...base, type, titre: `A créé ${info.nom}${nom ? ` ${nom}` : ""}` };
  }
  if (e.methode === "DELETE") return { ...base, type, titre: `A supprimé ${cible}` };

  // Changement de statut : on donne le nouveau statut dans la phrase
  if (typeof d.statut === "string") {
    const statut = libelleStatut(ressource, d.statut);
    if (ressource === "proprietaires" || ressource === "chauffeurs") {
      return { ...base, type, titre: `A changé le statut ${de(cible)} : ${statut}` };
    }
    if (ressource === "users" && Object.keys(d).length === 1) {
      return { ...base, type, titre: `A changé le statut du compte ${de(cible)} : ${statut}` };
    }
  }
  if (d.creer_compte) return { ...base, type, titre: `A créé le compte d'accès ${de(cible)}` };

  return { ...base, type, titre: `A modifié ${cible}` };
}

function libelleStatut(ressource: string, statut: string) {
  const liste: Record<string, { label: string }> =
    ressource === "proprietaires"
      ? STATUTS_FICHE
      : ressource === "chauffeurs"
        ? STATUTS_CHAUFFEUR
        : STATUTS_USER;
  return liste[statut]?.label ?? statut;
}

/** Libellés des champs envoyés à l'API. */
const LIBELLES: Record<string, string> = {
  identifiant: "Identifiant",
  nom: "Nom",
  prenom: "Prénom",
  email: "Email",
  password: "Mot de passe",
  mot_de_passe: "Mot de passe",
  telephone: "Téléphone",
  telephone_principal: "Téléphone principal",
  telephone_secondaire: "Téléphone secondaire",
  date_naissance: "Date de naissance",
  lieu_naissance: "Lieu de naissance",
  sexe: "Sexe",
  adresse: "Adresse",
  profession: "Profession",
  cin: "CIN",
  notes: "Notes",
  photo_chemin: "Photo",
  statut: "Statut",
  justification_statut: "Justification",
  creer_compte: "Création du compte d'accès",
  role_id: "Rôle",
  code: "Code",
  description: "Description",
  permissions: "Permissions",
  actif: "Actif",
  user_id: "Compte lié",
};

export function libelleChamp(champ: string) {
  if (LIBELLES[champ]) return LIBELLES[champ];
  const texte = champ.replace(/_id$/, "").replace(/_/g, " ");
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

/** Valeur lisible d'un champ ; une liste de lignes pour les permissions et les objets. */
export function valeurChamp(
  ressource: string,
  champ: string,
  valeur: unknown,
  nomDe: NomDe,
): string | string[] {
  if (valeur === null || valeur === undefined) return "—";
  if (valeur === "***") return "Masqué";
  if (valeur === "") return "Vidé";
  if (typeof valeur === "boolean") return valeur ? "Oui" : "Non";

  if (champ === "statut" && typeof valeur === "string") return libelleStatut(ressource, valeur);
  if (champ === "sexe")
    return valeur === "M" ? "Masculin" : valeur === "F" ? "Féminin" : String(valeur);
  if (champ === "cin" && typeof valeur === "string") return formaterCin(valeur) || valeur;
  if (champ.startsWith("telephone") && typeof valeur === "string") {
    return afficherTelephone(valeur) || valeur;
  }
  if (champ === "role_id" && typeof valeur === "number") {
    return nomDe("roles", valeur) ?? `Rôle n° ${valeur}`;
  }
  if (typeof valeur === "string" && /^\d{4}-\d{2}-\d{2}/.test(valeur)) return formatDate(valeur);

  if (champ === "permissions" && typeof valeur === "object") {
    const lignes = Object.entries(valeur as Record<string, Record<string, boolean>>)
      .map(([module, actions]) => {
        const accordees = Object.entries(actions ?? {})
          .filter(([, ok]) => ok)
          .map(([a]) => ACTIONS[a as keyof typeof ACTIONS] ?? a);
        if (accordees.length === 0) return null;
        return `${MODULES[module as keyof typeof MODULES] ?? module} : ${accordees.join(", ")}`;
      })
      .filter((l): l is string => l !== null);
    return lignes.length ? lignes : "Aucune permission";
  }

  if (Array.isArray(valeur)) return valeur.map((v) => String(v)).join(", ") || "—";
  if (typeof valeur === "object") {
    return Object.entries(valeur as Record<string, unknown>).map(
      ([k, v]) => `${libelleChamp(k)} : ${typeof v === "object" ? JSON.stringify(v) : String(v)}`,
    );
  }
  return String(valeur);
}
