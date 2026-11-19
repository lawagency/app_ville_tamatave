"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, LogIn } from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import PasswordInput from "@/components/PasswordInput";
import PortailHeader from "@/components/proprietaire/PortailHeader";
import { Field } from "@/components/ui";
import { useAuthStore } from "@/stores";

const EN_ATTENTE = "en attente de validation";

export default function ProprietaireLogin() {
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
      // Un compte de la mairie n'a rien à faire sur la plateforme propriétaire
      if (useAuthStore.getState().user?.role !== "proprietaire") {
        useAuthStore.getState().logout();
        throw new Error("Ce compte n'est pas un compte propriétaire.");
      }
      router.replace("/proprietaire/espace");
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  const enAttente = error?.includes(EN_ATTENTE);

  return (
    <>
      <PortailHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="card w-full max-w-md p-8">
          <span className="flex size-12 items-center justify-center rounded-md bg-primary/10 text-primary">
            <LogIn className="size-6" />
          </span>
          <h1 className="page-title mt-5">Connexion</h1>
          <p className="mt-1 text-sm text-text-muted">Accédez à votre espace propriétaire.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            {error &&
              (enAttente ? (
                <p className="alert-info flex items-start gap-2">
                  <Clock className="mt-0.5 size-4 shrink-0" />
                  Votre inscription est en cours de vérification par la mairie. Vous pourrez vous
                  connecter dès qu&apos;elle sera validée.
                </p>
              ) : (
                <p className="alert-error">{error}</p>
              ))}
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
            Pas encore de compte ?{" "}
            <Link href="/proprietaire/inscription" className="font-semibold text-primary">
              Créer mon compte
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
