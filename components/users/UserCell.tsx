import { BadgeCheck, CircleAlert, Mail, Phone, type LucideIcon } from "lucide-react";
import { Avatar } from "@/components/ui";
import type { User } from "@/types";

/** Icône de vérification : verte si vérifié, grise sinon, rien si l'API ne le précise pas. */
function Verification({ verifie, quoi }: { verifie?: boolean; quoi: string }) {
  if (verifie === undefined) return null;
  return verifie ? (
    <BadgeCheck className="size-4 shrink-0 text-secondary" aria-label={`${quoi} vérifié`}>
      <title>{`${quoi} vérifié`}</title>
    </BadgeCheck>
  ) : (
    <CircleAlert className="size-4 shrink-0 text-text-muted" aria-label={`${quoi} non vérifié`}>
      <title>{`${quoi} non vérifié`}</title>
    </CircleAlert>
  );
}

type LigneProps = {
  icon: LucideIcon;
  valeur: string | null;
  verifie?: boolean;
  quoi: string;
  className?: string;
};

function Ligne({ icon: Icon, valeur, verifie, quoi, className = "" }: LigneProps) {
  return (
    <p className={`flex items-center gap-1.5 ${className}`}>
      <Icon className="size-3.5 shrink-0 text-text-muted" />
      {valeur ? (
        <>
          <span className="truncate">{valeur}</span>
          <Verification verifie={verifie} quoi={quoi} />
        </>
      ) : (
        <span className="text-text-muted">--</span>
      )}
    </p>
  );
}

/** Colonne Utilisateur : nom, prénom et email avec sa vérification. */
export default function UserCell({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-4">
      <Avatar label={`${user.prenom} ${user.nom}`} />
      <div className="min-w-0 space-y-0.5">
        <p className="truncate text-text-main">
          <span className="font-bold uppercase">{user.nom}</span>{" "}
          <span className="font-medium">{user.prenom}</span>
        </p>
        <Ligne
          icon={Mail}
          valeur={user.email}
          verifie={user.email_verifie}
          quoi="Email"
          className="text-sm text-text-muted"
        />
      </div>
    </div>
  );
}

/** Colonne Téléphone : numéro avec sa vérification. */
export function TelephoneCell({ user }: { user: User }) {
  return (
    <Ligne icon={Phone} valeur={user.telephone} verifie={user.telephone_verifie} quoi="Téléphone" />
  );
}
