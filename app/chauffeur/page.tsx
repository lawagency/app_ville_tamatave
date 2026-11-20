"use client";

import Link from "next/link";
import { ArrowRight, Car, FileCheck2, IdCard, QrCode } from "lucide-react";
import TrafficIllustration from "@/components/login/TrafficIllustration";
import { PORTAIL_CHAUFFEUR } from "@/components/portail/portails";
import PortailHeader from "@/components/proprietaire/PortailHeader";
import { useAuthStore } from "@/stores";

const AVANTAGES = [
  {
    icon: IdCard,
    titre: "Votre profil",
    texte: "Suivez l'état de votre dossier auprès de la mairie.",
  },
  { icon: Car, titre: "Vos véhicules", texte: "Retrouvez les véhicules que vous conduisez." },
  {
    icon: FileCheck2,
    titre: "Vos documents",
    texte: "Consultez votre permis et vos autorisations, et leurs échéances.",
  },
  {
    icon: QrCode,
    titre: "Vos contrôles",
    texte: "Retrouvez l'historique des contrôles sur le terrain.",
  },
];

/** Accueil de la plateforme chauffeur : présentation et connexion (compte créé par la mairie). */
export default function ChauffeurAccueil() {
  const connecte = useAuthStore((s) => s.hydrated && s.user?.role === "chauffeur");

  return (
    <>
      <PortailHeader
        portail={PORTAIL_CHAUFFEUR}
        actions={
          connecte ? (
            <Link href="/chauffeur/espace" className="btn-primary">
              Mon espace
            </Link>
          ) : (
            <Link href="/chauffeur/login" className="btn-ghost">
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
            La plateforme des chauffeurs
          </h1>
          <div className="mt-4 h-1 w-12 rounded-sm bg-accent" />
          <p className="mt-6 text-text-muted">
            Les chauffeurs de transport de la commune sont enregistrés à la mairie. Cette plateforme
            vous permet de suivre votre dossier et de compléter votre profil, sans vous déplacer.
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

          <div className="mt-10">
            <Link
              href={connecte ? "/chauffeur/espace" : "/chauffeur/login"}
              className="btn-primary inline-flex items-center gap-2"
            >
              {connecte ? "Accéder à mon espace" : "Me connecter"}
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <p className="mt-4 text-xs text-text-muted">
            Pas encore de compte ? Il est créé par la mairie lors de votre enregistrement :
            présentez-vous avec votre CIN.
          </p>
        </div>

        <div className="hidden lg:block">
          <TrafficIllustration />
        </div>
      </main>
    </>
  );
}
