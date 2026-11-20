"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import PasswordInput from "@/components/PasswordInput";
import PortailHeader from "@/components/proprietaire/PortailHeader";
import { Field } from "@/components/ui";
import { ApiError } from "@/lib/api";
import type { StatutUser } from "@/types";
import { useAuthStore, useCompteNonActifStore, type ContactMairie } from "@/stores";
import type { Portail } from "./portails";

/** Connexion à une plateforme publique : seul le rôle du portail est accepté. */
export default function ConnexionPortail({ portail }: { portail: Portail }) {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(undefined);
    setLoading(true);
    try {
      await login(String(form.get("email")), String(form.get("password")));
      // Un compte d'un autre profil (mairie, propriétaire…) n'a rien à faire ici
      if (useAuthStore.getState().user?.role !== portail.role) {
        useAuthStore.getState().logout();
        throw new Error(`Ce compte n'est pas un compte ${portail.qui}.`);
      }
      router.replace(`${portail.base}/espace`);
    } catch (err) {
      // Compte non actif (suspendu, en attente…) : page dédiée avec le statut et la mairie
      if (err instanceof ApiError && err.donnees?.code === "COMPTE_NON_ACTIF") {
        useCompteNonActifStore.getState().definir({
          statut: err.donnees.statut as StatutUser,
          mairie: (err.donnees.mairie as ContactMairie | null) ?? null,
        });
        router.push(`${portail.base}/compte-non-actif`);
        return;
      }
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <>
      <PortailHeader portail={portail} />
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="card w-full max-w-md p-8">
          <span className="flex size-12 items-center justify-center rounded-md bg-primary/10 text-primary">
            <LogIn className="size-6" />
          </span>
          <h1 className="page-title mt-5">Connexion</h1>
          <p className="mt-1 text-sm text-text-muted">
            Accédez à votre {portail.libelle.toLowerCase()}.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            {error && <p className="alert-error">{error}</p>}
            <Field label="Email">
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="input-field"
              />
            </Field>
            <Field label="Mot de passe">
              <PasswordInput
                name="password"
                required
                autoComplete="current-password"
                className="input-field"
              />
            </Field>
            <LoadingButton type="submit" loading={loading} className="btn-primary w-full">
              Se connecter
            </LoadingButton>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            {portail.inscription ? (
              <>
                Pas encore de compte ?{" "}
                <Link href={`${portail.base}/inscription`} className="font-semibold text-primary">
                  Créer mon compte
                </Link>
              </>
            ) : (
              <>Pas encore de compte ? Votre compte est créé par la mairie.</>
            )}
          </p>
        </div>
      </main>
    </>
  );
}
