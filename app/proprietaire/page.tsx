"use client";

import Link from "next/link";
import { ArrowRight, Car, FileCheck2, QrCode, UserPlus } from "lucide-react";
import TrafficIllustration from "@/components/login/TrafficIllustration";
import PortailHeader from "@/components/proprietaire/PortailHeader";
import { useAuthStore } from "@/stores";

const AVANTAGES = [
  { icon: Car, titre: "Vos véhicules", texte: "Suivez les véhicules enregistrés à votre nom." },
  {
    icon: FileCheck2,
    titre: "Vos documents",
    texte: "Consultez l'état de vos autorisations et leurs échéances.",
  },
  {
    icon: QrCode,
    titre: "Vos contrôles",
    texte: "Retrouvez l'historique des contrôles sur le terrain.",
  },
];

/** Accueil de la plateforme propriétaire : présentation, connexion ou inscription. */
export default function ProprietaireAccueil() {
  const connecte = useAuthStore((s) => s.hydrated && s.user?.role === "proprietaire");

  return (
    <>
      <PortailHeader
        actions={
          connecte ? (
            <Link href="/proprietaire/espace" className="btn-primary">
              Mon espace
            </Link>
          ) : (
            <Link href="/proprietaire/login" className="btn-ghost">
              Connexion
            </Link>
          )
        }
      />

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-6 py-12 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-secondary">
            Commune urbaine de Toamasina
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-primary">
            La plateforme des propriétaires de véhicules
          </h1>
          <div className="mt-4 h-1 w-12 rounded-sm bg-accent" />
          <p className="mt-6 text-text-muted">
            La mairie de Toamasina suit les véhicules de transport qui circulent sur la commune. En
            tant que propriétaire, cette plateforme vous permet de suivre vos véhicules, vos
            documents et les contrôles effectués, sans vous déplacer.
          </p>

          <ul className="mt-8 space-y-4">
            {AVANTAGES.map(({ icon: Icon, titre, texte }) => (
              <li key={titre} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="block font-semibold">{titre}</span>
                  <span className="block text-sm text-text-muted">{texte}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            {connecte ? (
              <Link
                href="/proprietaire/espace"
                className="btn-primary inline-flex items-center gap-2"
              >
                Accéder à mon espace
                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/proprietaire/login"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  J&apos;ai déjà un compte
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/proprietaire/inscription"
                  className="btn-ghost inline-flex items-center gap-2"
                >
                  <UserPlus className="size-4" />
                  Créer mon compte
                </Link>
              </>
            )}
          </div>
          <p className="mt-4 text-xs text-text-muted">
            Toute inscription est vérifiée par la mairie avant l&apos;ouverture du compte.
          </p>
        </div>

        <div className="hidden lg:block">
          <TrafficIllustration />
        </div>
      </main>
    </>
  );
}
