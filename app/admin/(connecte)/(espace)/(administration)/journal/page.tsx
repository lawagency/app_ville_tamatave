"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Globe, Search, UserRound } from "lucide-react";
import DatePicker from "@/components/DatePicker";
import { Avatar, DataTable, FilterTabs, PageHeader, StatusDot } from "@/components/ui";
import { formatDateTime, formatRelative } from "@/lib/api";
import { peutVoir } from "@/lib/espaces";
import {
  TYPES_ACTION,
  decrire,
  libelleChamp,
  valeurChamp,
  type NomDe,
  type TypeAction,
} from "@/lib/journal";
import type { JournalActivite } from "@/types";
import {
  useAuthStore,
  useCategoriesServicesStore,
  useChauffeursStore,
  useJournalStore,
  useProprietairesStore,
  useRolesStore,
  useUnitesControleStore,
  useUsersStore,
} from "@/stores";

type Onglet = "tous" | TypeAction;

/**
 * Couleur de la ligne : vert création, bleu modification, rouge suppression.
 * Noms écrits en entier : Tailwind ne génère que les classes qu'il trouve telles quelles.
 */
const COULEUR_LIGNE: Record<TypeAction, string> = {
  creation: "row-creation",
  modification: "row-modification",
  suppression: "row-suppression",
  connexion: "",
};
type Periode = "tout" | "aujourdhui" | "7jours" | "jour";

/** Date locale au format « AAAA-MM-JJ », comparable comme du texte. */
function cleDuJour(date: Date) {
  const deux = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${deux(date.getMonth() + 1)}-${deux(date.getDate())}`;
}

/** Premier et dernier jour inclus de la période, ou `null` pour tout le journal. */
function bornesDe(periode: Periode, jour: string): [string, string] | null {
  const aujourdhui = new Date();
  if (periode === "aujourdhui") return [cleDuJour(aujourdhui), cleDuJour(aujourdhui)];
  if (periode === "7jours") {
    const debut = new Date(aujourdhui);
    debut.setDate(debut.getDate() - 6);
    return [cleDuJour(debut), cleDuJour(aujourdhui)];
  }
  if (periode === "jour" && jour) return [jour, jour];
  return null;
}

/** Listes qui servent à afficher un nom à la place d'un id (« le propriétaire n° 3 »). */
const LISTES = [
  { ressource: "proprietaires", module: "proprietaires", store: useProprietairesStore },
  { ressource: "chauffeurs", module: "chauffeurs", store: useChauffeursStore },
  { ressource: "users", module: "users", store: useUsersStore },
  { ressource: "roles", module: "roles", store: useRolesStore },
  { ressource: "unites-controle", module: "unites", store: useUnitesControleStore },
  { ressource: "categories-services", module: "categories", store: useCategoriesServicesStore },
] as const;

type Nommable = { id: number; nom?: string; prenom?: string };

// Connexion et inscription : pas encore de session, l'email envoyé identifie l'auteur
const auteurDe = (e: JournalActivite) =>
  e.prenom || e.nom
    ? `${e.prenom ?? ""} ${e.nom ?? ""}`.trim()
    : (e.utilisateur_email ??
      (typeof e.donnees_envoyees?.email === "string" ? e.donnees_envoyees.email : "Système"));

export default function JournalPage() {
  const journal = useJournalStore();
  const user = useAuthStore((s) => s.user);
  const [onglet, setOnglet] = useState<Onglet>("tous");
  const [recherche, setRecherche] = useState("");
  const [periode, setPeriode] = useState<Periode>("aujourdhui");
  const [jour, setJour] = useState("");
  // Change à chaque retour sur un raccourci : vide le calendrier
  const [cleCalendrier, setCleCalendrier] = useState(0);

  // Abonnement aux listes : les noms s'affichent dès qu'elles sont chargées
  const proprietaires = useProprietairesStore((s) => s.items);
  const chauffeurs = useChauffeursStore((s) => s.items);
  const users = useUsersStore((s) => s.items);
  const roles = useRolesStore((s) => s.items);
  const unites = useUnitesControleStore((s) => s.items);
  const categories = useCategoriesServicesStore((s) => s.items);

  useEffect(() => {
    useJournalStore.getState().fetchAll({ force: true });
    for (const { module, store } of LISTES) {
      if (peutVoir(user, module)) store.getState().fetchAll();
    }
  }, [user]);

  const listes: Record<string, Nommable[]> = {
    proprietaires,
    chauffeurs,
    users,
    roles,
    "unites-controle": unites,
    "categories-services": categories,
  };
  const nomDe: NomDe = (ressource, id) => {
    const item = listes[ressource]?.find((i) => Number(i.id) === id);
    if (!item) return undefined;
    return item.prenom ? `${item.prenom} ${item.nom?.toUpperCase() ?? ""}`.trim() : item.nom;
  };

  // La date du jour n'est lue que s'il y a des lignes : rien au rendu prégénéré
  const bornes = journal.items.length ? bornesDe(periode, jour) : null;
  const q = recherche.trim().toLowerCase();
  // Période et recherche d'abord : les compteurs des types portent sur ce résultat
  const lignes = journal.items
    .filter((e) => {
      if (!bornes) return true;
      const cle = cleDuJour(new Date(e.created_at));
      return cle >= bornes[0] && cle <= bornes[1];
    })
    .map((e) => ({ ...e, description: decrire(e, nomDe) }))
    .filter(
      (l) =>
        !q ||
        [l.description.titre, auteurDe(l), l.utilisateur_email, l.ip_address].some((v) =>
          v?.toLowerCase().includes(q),
        ),
    );
  const visibles = lignes.filter((l) => onglet === "tous" || l.description.type === onglet);
  const compte = (t: TypeAction) => lignes.filter((l) => l.description.type === t).length;

  function choisirRaccourci(p: Periode) {
    setPeriode(p);
    setJour("");
    setCleCalendrier((k) => k + 1);
  }

  return (
    <>
      <PageHeader
        title="Journal d'activité"
        subtitle="Toutes les créations, modifications et suppressions faites dans le logiciel"
      />

      <DataTable
        loading={journal.loading}
        error={journal.error}
        rows={visibles}
        pageSize={20}
        toolbar={
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <FilterTabs
                value={periode}
                onChange={choisirRaccourci}
                tabs={[
                  { key: "tout", label: "Tout", tone: "primary" },
                  { key: "aujourdhui", label: "Aujourd'hui", tone: "primary" },
                  { key: "7jours", label: "7 derniers jours", tone: "primary" },
                ]}
              />
              <div className="w-52">
                <DatePicker
                  key={cleCalendrier}
                  placeholder="Un jour précis…"
                  onChange={(v) => {
                    setJour(v);
                    setPeriode(v ? "jour" : "aujourdhui");
                  }}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <FilterTabs
                value={onglet}
                onChange={setOnglet}
                tabs={[
                  { key: "tous", label: "Tout", count: lignes.length, tone: "primary" },
                  ...(Object.keys(TYPES_ACTION) as TypeAction[]).map((t) => ({
                    key: t,
                    label: TYPES_ACTION[t].label,
                    count: compte(t),
                    tone: TYPES_ACTION[t].tone,
                  })),
                ]}
              />
              <div className="relative w-full max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="search"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  placeholder="Rechercher une action, un agent…"
                  className="input-field pl-9"
                />
              </div>
            </div>
          </div>
        }
        columns={[
          {
            label: "Date",
            render: (l) => (
              <time dateTime={l.created_at} title={formatDateTime(l.created_at)}>
                <span className="block font-medium">{formatRelative(l.created_at)}</span>
                <span className="block text-xs text-text-muted">
                  {formatDateTime(l.created_at)}
                </span>
              </time>
            ),
          },
          {
            label: "Agent",
            render: (l) => (
              <div className="flex items-center gap-3">
                <Avatar label={auteurDe(l)} className="size-9" />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{auteurDe(l)}</p>
                  {l.utilisateur_email && (
                    <p className="truncate text-xs text-text-muted">{l.utilisateur_email}</p>
                  )}
                </div>
              </div>
            ),
          },
          {
            label: "Action",
            render: (l) => {
              const Icon = l.description.icon;
              return (
                <span className="flex items-center gap-3 whitespace-normal">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/5 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <span className="font-medium">{l.description.titre}</span>
                </span>
              );
            },
          },
          {
            label: "Type",
            render: (l) => {
              const { label, tone } = TYPES_ACTION[l.description.type];
              return <StatusDot tone={tone} label={label} />;
            },
          },
        ]}
        renderDetails={(l) => <DetailJournal ligne={l} nomDe={nomDe} />}
        rowClassName={(l) => COULEUR_LIGNE[l.description.type]}
      />
    </>
  );
}

/** Détail lisible d'une ligne : qui, quand, d'où, et chaque champ envoyé avec son libellé. */
function DetailJournal({
  ligne: l,
  nomDe,
}: {
  ligne: JournalActivite & { description: ReturnType<typeof decrire> };
  nomDe: NomDe;
}) {
  const { ressource = "", ressourceId } = l.description;
  const champs = Object.entries(l.donnees_envoyees ?? {});

  return (
    <div className="space-y-5 whitespace-normal">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-base font-bold">{l.description.titre}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="size-4" />
              {auteurDe(l)}
            </span>
            <span>{formatDateTime(l.created_at)}</span>
            {l.ip_address && (
              <span className="inline-flex items-center gap-1.5">
                <Globe className="size-4" />
                {l.ip_address.replace(/^::ffff:/, "")}
              </span>
            )}
          </p>
        </div>
        {(ressource === "proprietaires" || ressource === "chauffeurs") &&
          ressourceId &&
          l.description.type !== "suppression" && (
            <Link
              href={`/admin/${ressource}/${ressourceId}`}
              className="btn-ghost inline-flex items-center gap-2 text-sm"
            >
              Voir la fiche
              <ArrowRight className="size-4" />
            </Link>
          )}
      </div>

      {champs.length > 0 ? (
        <div className="overflow-hidden rounded-md border border-border bg-surface">
          <p className="border-b border-border bg-background px-4 py-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Informations enregistrées
          </p>
          <dl className="divide-y divide-border">
            {champs.map(([champ, valeur]) => {
              const affichage = valeurChamp(ressource, champ, valeur, nomDe);
              const neutre = affichage === "—" || affichage === "Vidé" || affichage === "Masqué";
              return (
                <div
                  key={champ}
                  className="grid gap-1 px-4 py-2.5 text-sm sm:grid-cols-[14rem_1fr]"
                >
                  <dt className="text-text-muted">{libelleChamp(champ)}</dt>
                  <dd className={neutre ? "italic text-text-muted" : "font-medium"}>
                    {Array.isArray(affichage) ? (
                      <ul className="space-y-1">
                        {affichage.map((ligne) => (
                          <li key={ligne}>{ligne}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="whitespace-pre-line">{affichage}</span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      ) : (
        <p className="text-sm text-text-muted">Aucune information envoyée avec cette action.</p>
      )}

      <p className="text-xs text-text-muted">
        Requête : <code className="font-mono">{l.methode}</code>{" "}
        <code className="font-mono">{l.url}</code>
      </p>
    </div>
  );
}
