"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Car } from "lucide-react";
import { CellTitle, DataTable, StatusDot, type Column } from "@/components/ui";
import { fichierUrl } from "@/lib/api";
import { AUTORISATIONS_CIRCULATION, STATUTS_VEHICULE, marqueModele, type Vehicule } from "@/types";

type Colonne = "proprietaire" | "chauffeur" | "autorisation";

type Props = {
  rows: Vehicule[];
  loading?: boolean;
  error?: string;
  /** Fiche du véhicule : la ligne et l'immatriculation y mènent. */
  lien?: (v: Vehicule) => string;
  /** Liens vers les fiches du propriétaire et du chauffeur (admin). */
  lienProprietaire?: (id: number) => string;
  lienChauffeur?: (id: number) => string;
  /** Colonnes inutiles ici (ex. le propriétaire dans sa propre fiche). */
  masquer?: Colonne[];
  actions?: (v: Vehicule) => ReactNode;
  toolbar?: ReactNode;
};

/** Personne liée au véhicule : nom (lien éventuel) et précision dessous. */
function Personne({
  nom,
  detail,
  href,
}: {
  nom: string | null;
  detail?: string | null;
  href?: string;
}) {
  if (!nom) return <span className="text-text-muted">—</span>;
  const contenu = (
    <>
      <p className="font-medium">{nom}</p>
      {detail && <p className="text-xs text-text-muted">{detail}</p>}
    </>
  );
  return href ? (
    <Link
      href={href}
      onClick={(e) => e.stopPropagation()}
      className="block hover:text-primary hover:underline"
    >
      {contenu}
    </Link>
  ) : (
    <div>{contenu}</div>
  );
}

/** Tableau des véhicules, partagé par l'admin, les espaces et les fiches. */
export default function TableVehicules({
  rows,
  loading = false,
  error,
  lien,
  lienProprietaire,
  lienChauffeur,
  masquer = [],
  actions,
  toolbar,
}: Props) {
  const router = useRouter();

  const colonnes: (Column<Vehicule> | false)[] = [
    {
      label: "Véhicule",
      render: (v) => {
        const titre = (
          <CellTitle
            title={v.immatriculation}
            subtitle={
              <>
                {v.nom && <span className="font-medium text-text-main">{v.nom} · </span>}
                <code>{v.identifiant}</code>
              </>
            }
            photo={fichierUrl(v.photo_chemin)}
            icon={<Car className="size-5" />}
          />
        );
        return lien ? (
          // Lien en plus du clic sur la ligne : ouverture dans un nouvel onglet possible
          <Link
            href={lien(v)}
            onClick={(e) => e.stopPropagation()}
            className="block hover:[&_p:first-child]:text-primary"
          >
            {titre}
          </Link>
        ) : (
          titre
        );
      },
    },
    {
      label: "Type",
      render: (v) => (
        <div>
          <p className="font-medium">{v.type_nom ?? "—"}</p>
          {v.categorie_nom && <p className="text-xs text-text-muted">{v.categorie_nom}</p>}
        </div>
      ),
    },
    { label: "Marque", render: (v) => marqueModele(v) ?? "—" },
    !masquer.includes("proprietaire") && {
      label: "Propriétaire",
      render: (v) => (
        <Personne
          nom={v.proprietaire_nom}
          detail={v.proprietaire_identifiant}
          href={
            v.proprietaire_actuel_id && lienProprietaire
              ? lienProprietaire(v.proprietaire_actuel_id)
              : undefined
          }
        />
      ),
    },
    !masquer.includes("chauffeur") && {
      label: "Chauffeur",
      render: (v) => (
        <Personne
          nom={v.chauffeur_nom}
          detail={v.chauffeur_type_nom}
          href={
            v.chauffeur_actuel_id && lienChauffeur
              ? lienChauffeur(v.chauffeur_actuel_id)
              : undefined
          }
        />
      ),
    },
    {
      label: "Statut",
      render: (v) => {
        const { label, tone } = STATUTS_VEHICULE[v.statut] ?? { label: v.statut, tone: "muted" };
        return <StatusDot tone={tone} label={label} />;
      },
    },
    !masquer.includes("autorisation") && {
      label: "Autorisation",
      render: (v) => {
        const { label, tone } = AUTORISATIONS_CIRCULATION[v.autorisation_circulation] ?? {
          label: v.autorisation_circulation,
          tone: "muted",
        };
        return <StatusDot tone={tone} label={label} />;
      },
    },
    !!actions && { label: "Actions", align: "right", render: actions },
  ];

  return (
    <DataTable
      loading={loading}
      error={error}
      rows={rows}
      toolbar={toolbar}
      onRowClick={lien ? (v) => router.push(lien(v)) : undefined}
      columns={colonnes.filter((c): c is Column<Vehicule> => !!c)}
    />
  );
}
