"use client";

import Link from "next/link";
import { ArrowRight, Car, ClipboardList, Hash, MapPin, QrCode, ShieldCheck } from "lucide-react";
import { BarreCompletion, Etape, Stat } from "@/components/portail/ProfilElements";
import Skeleton from "@/components/Skeleton";
import { Avatar } from "@/components/ui";
import { fichierUrl, formatDate } from "@/lib/api";
import { completion } from "@/lib/maFiche";
import { STATUTS_FICHE } from "@/types";
import { useAuthStore, useMaFicheStore } from "@/stores";

/** Tableau de bord du propriétaire. */
export default function EspaceTableauDeBord() {
  const user = useAuthStore((s) => s.user);
  const { fiche, error } = useMaFicheStore();

  if (error) return <p className="alert-error">{error}</p>;
  if (!fiche) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  const { manquants, pct } = completion(fiche);
  const statut = STATUTS_FICHE[fiche.statut ?? "en_verification"];
  const valide = fiche.statut === "actif";
  const nom = `${fiche.prenom} ${fiche.nom.toUpperCase()}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Bonjour {user?.prenom}</h1>
        <p className="mt-1 text-text-muted">
          Voici l&apos;état de votre dossier auprès de la mairie.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Profil complété" valeur={`${pct} %`} icon={ClipboardList} />
        <Stat label="Véhicules" valeur="—" icon={Car} aide="Bientôt disponible" />
        <Stat label="Contrôles" valeur="—" icon={QrCode} aide="Bientôt disponible" />
        <Stat label="Statut du dossier" valeur={statut.label} icon={ShieldCheck} enAvant />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="card p-8 xl:col-span-2">
          <p className="text-sm text-text-muted">Mon dossier</p>
          <h2 className="mt-1 text-2xl font-bold">
            {valide ? "Dossier validé" : "Dossier en cours"}
          </h2>

          <div className="mt-6">
            <BarreCompletion pct={pct} manquants={manquants.length} />
          </div>

          <ol className="mt-8 space-y-5">
            <Etape
              fait
              titre="Inscription"
              texte={`Compte créé le ${formatDate(fiche.created_at)}.`}
            />
            <Etape
              fait={manquants.length === 0}
              titre="Profil complet"
              texte={
                manquants.length === 0
                  ? "Toutes vos informations sont renseignées."
                  : `Il manque : ${manquants.map((m) => m.label.toLowerCase()).join(", ")}.`
              }
            />
            <Etape
              fait={valide}
              titre="Validation par la mairie"
              texte={
                valide
                  ? "La mairie a vérifié votre dossier."
                  : "La mairie vérifie vos informations et vos pièces."
              }
            />
          </ol>

          {manquants.length > 0 && (
            <Link
              href="/proprietaire/espace/profil"
              className="btn-primary mt-8 inline-flex items-center gap-2"
            >
              Compléter mon profil
              <ArrowRight className="size-4" />
            </Link>
          )}
        </section>

        <section className="card flex flex-col items-center p-8 text-center">
          <Avatar
            label={nom}
            photo={fichierUrl(fiche.photo_chemin)}
            className="size-32 bg-primary/5 text-3xl"
          />
          <h2 className="mt-5 text-xl font-bold">{nom}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-text-muted">
            <MapPin className="size-4" />
            {fiche.adresse || "Adresse à compléter"}
          </p>

          <dl className="mt-8 grid w-full grid-cols-3 gap-2">
            <div>
              <dt className="text-xs text-text-muted">Identifiant</dt>
              <dd className="mt-1 flex items-center justify-center gap-1 text-sm font-bold text-primary">
                <Hash className="size-3.5" />
                {fiche.identifiant}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Inscrit le</dt>
              <dd className="mt-1 text-sm font-bold">{formatDate(fiche.created_at)}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Profil</dt>
              <dd className="mt-1 text-sm font-bold">{pct} %</dd>
            </div>
          </dl>

          <Link href="/proprietaire/espace/profil" className="btn-ghost mt-8 w-full text-center">
            Voir mon profil
          </Link>
        </section>
      </div>
    </div>
  );
}
