"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TrafficIllustration from "@/components/login/TrafficIllustration";
import { useAuthStore } from "@/stores";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(undefined);
    setLoading(true);
    try {
      await login(String(form.get("email")), String(form.get("password")));
      // Les propriétaires ont leur propre plateforme
      if (useAuthStore.getState().user?.role === "proprietaire") {
        useAuthStore.getState().logout();
        throw new Error(
          "Compte propriétaire : connectez-vous sur l'espace propriétaire (/proprietaire).",
        );
      }
      router.replace("/admin/espaces");
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="relative flex flex-1 min-h-screen items-center justify-center overflow-hidden bg-primary p-4">
      <div className="absolute -top-32 -left-24 size-96 rounded-full bg-primary-hover" />
      <div className="absolute -bottom-40 -right-20 size-112 rounded-full bg-accent/90" />
      <div className="absolute top-1/3 -right-24 size-72 rounded-full bg-secondary/80" />
      <div className="absolute -bottom-24 left-1/4 size-64 rounded-full bg-primary-hover/70" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-lg bg-surface shadow-2xl md:grid-cols-2">
        <div className="flex flex-col justify-center px-8 py-12 md:px-14">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-md bg-primary font-bold text-accent">
              VT
            </div>
            <div>
              <p className="font-bold text-primary leading-tight">Ville de Toamasina</p>
              <p className="text-xs text-text-muted">Suivi de la circulation</p>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-primary">Connexion</h1>
          <div className="mt-2 mb-8 h-1 w-12 rounded-sm bg-accent" />

          <form onSubmit={onSubmit} className="space-y-5">
            {error && <p className="alert-error">{error}</p>}

            <label className="block">
              <span className="label-field">Email</span>
              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 fill-none stroke-text-muted"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="agent@toamasina.mg"
                  className="input-field bg-background pl-10"
                />
              </div>
            </label>

            <label className="block">
              <span className="label-field">Mot de passe</span>
              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 fill-none stroke-text-muted"
                  strokeWidth="1.8"
                >
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input-field bg-background pl-10 pr-20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary"
                >
                  {showPassword ? "Masquer" : "Afficher"}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 uppercase tracking-wider disabled:opacity-60"
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <p className="mt-8 text-xs text-text-muted">
            Espace réservé aux agents de la commune et des corps de contrôle.
          </p>
        </div>

        <div className="hidden flex-col items-center justify-center bg-background px-8 py-12 md:flex">
          <TrafficIllustration />
          <p className="mt-6 text-center text-lg font-semibold text-primary">
            Circulation sûre et contrôlée
          </p>
          <p className="mt-1 max-w-xs text-center text-sm text-text-muted">
            Propriétaires, véhicules, chauffeurs et contrôles réunis sur une seule plateforme.
          </p>
        </div>
      </div>
    </div>
  );
}
