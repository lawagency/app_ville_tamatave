"use client";

import { useEffect } from "react";
import { Car, ClipboardCheck, Clock, OctagonAlert, UserRound } from "lucide-react";
import ResultatDot from "@/components/controles/ResultatDot";
import MonthlyBarChart, { type BarDatum } from "@/components/dashboard/MonthlyBarChart";
import ResultatBreakdown from "@/components/dashboard/ResultatBreakdown";
import StatCard from "@/components/dashboard/StatCard";
import Skeleton from "@/components/Skeleton";
import { CellTitle, DataTable, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/api";
import type { Controle } from "@/types";
import { useAuthStore, useControlesStore, useProprietairesStore } from "@/stores";

const NB_MOIS = 6;

function moisKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

/** Nombre de contrôles pour chacun des 6 derniers mois. */
function controlesParMois(controles: Controle[], maintenant: Date): BarDatum[] {
  return Array.from({ length: NB_MOIS }, (_, i) => {
    const mois = new Date(maintenant.getFullYear(), maintenant.getMonth() - (NB_MOIS - 1 - i), 1);
    return {
      label: mois.toLocaleDateString("fr-FR", { month: "short" }),
      value: controles.filter((c) => moisKey(new Date(c.date_controle)) === moisKey(mois)).length,
    };
  });
}

function pourcentage(part: number, total: number) {
  return total ? `${Math.round((part / total) * 100)} % des contrôles` : undefined;
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const proprietaires = useProprietairesStore();
  const controles = useControlesStore();

  useEffect(() => {
    useProprietairesStore.getState().fetchAll();
    useControlesStore.getState().fetchAll();
  }, []);

  const maintenant = new Date();
  const ceMois = moisKey(maintenant);
  const total = controles.items.length;
  const parResultat = (r: Controle["resultat"]) =>
    controles.items.filter((c) => c.resultat === r).length;
  const nouveauxProprietaires = proprietaires.items.filter(
    (p) => moisKey(new Date(p.created_at)) === ceMois,
  ).length;
  const controlesDuMois = controles.items.filter(
    (c) => moisKey(new Date(c.date_controle)) === ceMois,
  ).length;

  const pret = (s: { loading: boolean; error?: string }) => !s.loading && !s.error;

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        subtitle={user ? `Bienvenue, ${user.prenom} ${user.nom}` : undefined}
      />

      <div className="mb-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Propriétaires"
          badge="badge-primary"
          icon={UserRound}
          iconClass="text-primary"
          loading={proprietaires.loading}
          value={pret(proprietaires) ? proprietaires.items.length : undefined}
          detail={pret(proprietaires) ? `+${nouveauxProprietaires} ce mois-ci` : undefined}
          href="/admin/proprietaires"
        />
        <StatCard
          label="Contrôles"
          badge="badge-success"
          icon={ClipboardCheck}
          iconClass="text-secondary"
          loading={controles.loading}
          value={pret(controles) ? total : undefined}
          detail={pret(controles) ? `${controlesDuMois} ce mois-ci` : undefined}
          href="/admin/controles"
        />
        <StatCard
          label="À renouveler"
          badge="badge-warning"
          icon={Clock}
          iconClass="text-accent"
          loading={controles.loading}
          value={pret(controles) ? parResultat("a_renouveler") : undefined}
          detail={pourcentage(parResultat("a_renouveler"), total)}
          href="/admin/controles"
        />
        <StatCard
          label="Non autorisés"
          badge="badge-danger"
          icon={OctagonAlert}
          iconClass="text-danger"
          loading={controles.loading}
          value={pret(controles) ? parResultat("non_autorise") : undefined}
          detail={pourcentage(parResultat("non_autorise"), total)}
          href="/admin/controles"
        />
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-5">
        <div className="card xl:col-span-3">
          <h2 className="card-title mb-6">Contrôles par mois</h2>
          {controles.error ? (
            <p className="alert-error">{controles.error}</p>
          ) : controles.loading ? (
            <div className="flex h-64 items-end gap-6 pl-11">
              {[45, 70, 55, 85, 60, 75].map((h, i) => (
                <Skeleton key={i} className="flex-1" style={{ height: `${h}%` }} />
              ))}
            </div>
          ) : (
            <MonthlyBarChart
              data={controlesParMois(controles.items, maintenant)}
              unit="contrôles"
            />
          )}
        </div>

        <div className="card xl:col-span-2">
          <h2 className="card-title mb-6">Répartition des résultats</h2>
          {controles.error ? (
            <p className="alert-error">{controles.error}</p>
          ) : controles.loading ? (
            <div className="space-y-6">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <ResultatBreakdown controles={controles.items} />
          )}
        </div>
      </div>

      <DataTable
        title="Derniers contrôles"
        loading={controles.loading}
        error={controles.error}
        rows={controles.items.slice(0, 5)}
        columns={[
          {
            label: "Véhicule",
            render: (c) => (
              <CellTitle
                title={c.immatriculation ?? `Contrôle n°${c.id}`}
                subtitle={formatDate(c.date_controle)}
                icon={<Car className="size-5" />}
              />
            ),
          },
          { label: "Chauffeur", render: (c) => c.chauffeur_nom ?? "—" },
          { label: "Résultat", render: (c) => <ResultatDot resultat={c.resultat} /> },
        ]}
      />
    </>
  );
}
