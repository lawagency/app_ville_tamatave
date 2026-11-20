"use client";

import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  ClipboardList,
  Hash,
  MapPin,
  ShieldBan,
  ShieldCheck,
  Tag,
  Timer,
} from "lucide-react";
import { BarreCompletion, Etape, Stat } from "@/components/portail/ProfilElements";
import Skeleton from "@/components/Skeleton";
import { Avatar } from "@/components/ui";
import { fichierUrl, formatDate } from "@/lib/api";
import { completionChauffeur, statutDuChauffeur } from "@/lib/maFicheChauffeur";
import { situationDe } from "@/types";
import { useAuthStore, useMaFicheChauffeurStore } from "@/stores";

/** Tableau de bord du chauffeur : état du dossier, situation, employeur. */
export default function EspaceChauffeurTableauDeBord() {
  const user = useAuthStore((s) => s.user);
  const { fiche, error } = useMaFicheChauffeurStore();

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

  const { manquants, pct } = completionChauffeur(fiche);
  const statut = statutDuChauffeur(fiche);
  const valide = fiche.statut === "actif";
  const nom = `${fiche.prenom} ${fiche.nom.toUpperCase()}`;
  const situation = fiche.est_blackliste ? "Liste noire" : situationDe(fiche).label;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Bonjour {user?.prenom}</h1>
        <p className="mt-1 text-text-muted">
          Voici l&apos;état de votre dossier auprès de la mairie.
        </p>
      </div>

      {fiche.est_blackliste && (
        <div className="alert-error flex items-start gap-3">
          <ShieldBan className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-bold">
              Vous êtes sur liste noire
              {fiche.date_blacklist && ` depuis le ${formatDate(fiche.date_blacklist)}`}
            </p>
            {fiche.raison_blacklist && (
              <p className="mt-1 whitespace-pre-line text-sm">{fiche.raison_blacklist}</p>
            )}
            <p className="mt-1 text-sm">Vous ne pouvez pas conduire. Contactez la mairie.</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Profil complété" valeur={`${pct} %`} icon={ClipboardList} />
        <Stat
          label="Situation"
          valeur={situation}
          icon={Timer}
          aide={fiche.proprietaire_id ? "Gérée par votre propriétaire" : undefined}
        />
        <Stat
          label="Type de chauffeur"
          valeur={fiche.type_chauffeur_nom ?? "—"}
          icon={Tag}
          aide={fiche.type_vehicule_nom ?? undefined}
        />
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
              titre="Enregistrement"
              texte={`Fiche créée le ${formatDate(fiche.date_enregistrement ?? fiche.created_at)}.`}
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
            <Etape fait={valide} titre="Validation par la mairie" texte={statut.texte} />
          </ol>

          {manquants.length > 0 && (
            <Link
              href="/chauffeur/espace/profil"
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

          <dl className="mt-8 grid w-full grid-cols-2 gap-4 text-left">
            <div>
              <dt className="text-xs text-text-muted">Identifiant</dt>
              <dd className="mt-1 flex items-center gap-1 text-sm font-bold text-primary">
                <Hash className="size-3.5" />
                {fiche.identifiant}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Employeur</dt>
              <dd className="mt-1 flex items-center gap-1 text-sm font-bold">
                <Briefcase className="size-3.5 shrink-0" />
                <span className="truncate">{fiche.proprietaire_nom ?? "Aucun"}</span>
              </dd>
            </div>
          </dl>

          <Link href="/chauffeur/espace/profil" className="btn-ghost mt-8 w-full text-center">
            Voir mon profil
          </Link>
        </section>
      </div>
    </div>
  );
}
