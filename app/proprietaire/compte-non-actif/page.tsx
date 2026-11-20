"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Ban,
  Building2,
  CircleMinus,
  CircleX,
  Clock,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import PortailHeader from "@/components/proprietaire/PortailHeader";
import StatutBadge from "@/components/users/StatutBadge";
import { afficherTelephone } from "@/lib/formats";
import type { StatutUser } from "@/types";
import { useCompteNonActifStore } from "@/stores";

/** Ce que chaque statut veut dire pour le propriétaire, et ce qu'il doit faire. */
const MESSAGES: Partial<
  Record<
    StatutUser,
    { icon: LucideIcon; couleur: string; titre: string; texte: string; action: string }
  >
> = {
  en_attente: {
    icon: Clock,
    couleur: "bg-accent/20 text-text-main",
    titre: "Votre inscription est en cours de vérification",
    texte:
      "La mairie vérifie vos informations et vos pièces. Vous pourrez vous connecter dès que votre compte sera validé.",
    action: "Si la vérification prend du temps, vous pouvez contacter la mairie.",
  },
  suspendu: {
    icon: Ban,
    couleur: "bg-danger/10 text-danger",
    titre: "Votre compte est suspendu",
    texte:
      "La mairie a temporairement bloqué l'accès à votre espace propriétaire. Cette suspension peut être levée.",
    action:
      "Contactez la mairie pour connaître la raison et les démarches pour réactiver votre compte.",
  },
  inactif: {
    icon: CircleMinus,
    couleur: "bg-text-muted/15 text-text-muted",
    titre: "Votre compte est désactivé",
    texte: "L'accès à votre espace propriétaire n'est plus ouvert pour le moment.",
    action: "Contactez la mairie pour faire réactiver votre compte.",
  },
  rejete: {
    icon: CircleX,
    couleur: "bg-danger/10 text-danger",
    titre: "Votre inscription a été refusée",
    texte:
      "La mairie n'a pas pu valider votre inscription, par exemple à cause de pièces incomplètes ou non conformes.",
    action: "Présentez-vous à la mairie avec vos pièces d'identité pour régulariser votre dossier.",
  },
};

const PAR_DEFAUT = {
  icon: ShieldAlert,
  couleur: "bg-danger/10 text-danger",
  titre: "Votre compte ne permet pas de vous connecter",
  texte: "L'accès à votre espace propriétaire est bloqué.",
  action: "Contactez la mairie pour en savoir plus.",
};

function Contact({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-text-muted">{label}</p>
        <p className="mt-0.5 break-words text-sm font-semibold">{children}</p>
      </div>
    </div>
  );
}

/** Page affichée quand la connexion est refusée parce que le compte n'est pas actif. */
export default function CompteNonActifPage() {
  const compte = useCompteNonActifStore((s) => s.compte);
  const message = (compte && MESSAGES[compte.statut]) ?? PAR_DEFAUT;
  const Icon = message.icon;
  const mairie = compte?.mairie;

  return (
    <>
      <PortailHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="card w-full max-w-lg p-8">
          <span
            className={`flex size-14 items-center justify-center rounded-full ${message.couleur}`}
          >
            <Icon className="size-7" />
          </span>
          <h1 className="page-title mt-5">{message.titre}</h1>
          {compte && (
            <p className="mt-3 flex items-center gap-2 text-sm text-text-muted">
              Statut de votre compte : <StatutBadge statut={compte.statut} />
            </p>
          )}
          <p className="mt-4 text-text-main">{message.texte}</p>
          <p className="mt-2 text-sm text-text-muted">{message.action}</p>

          <section className="mt-8 rounded-md border border-border bg-background p-5">
            <h2 className="flex items-center gap-2 font-bold">
              <Building2 className="size-5 text-primary" />
              Contacter la mairie
            </h2>
            {mairie?.nom && <p className="mt-1 text-sm text-text-muted">{mairie.nom}</p>}
            {mairie && (mairie.telephone || mairie.email || mairie.adresse) ? (
              <div className="mt-4 grid gap-4">
                {mairie.telephone && (
                  <Contact icon={Phone} label="Téléphone">
                    <a
                      href={`tel:${mairie.telephone.replace(/\s/g, "")}`}
                      className="hover:text-primary"
                    >
                      {afficherTelephone(mairie.telephone) || mairie.telephone}
                    </a>
                  </Contact>
                )}
                {mairie.email && (
                  <Contact icon={Mail} label="Email">
                    <a href={`mailto:${mairie.email}`} className="hover:text-primary">
                      {mairie.email}
                    </a>
                  </Contact>
                )}
                {mairie.adresse && (
                  <Contact icon={MapPin} label="Adresse">
                    {mairie.adresse}
                  </Contact>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-text-muted">
                Présentez-vous à la mairie avec votre pièce d&apos;identité (CIN).
              </p>
            )}
          </section>

          <Link
            href="/proprietaire/login"
            className="btn-ghost mt-8 inline-flex w-full items-center justify-center gap-2"
          >
            <ArrowLeft className="size-4" />
            Retour à la connexion
          </Link>
        </div>
      </main>
    </>
  );
}
