"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, KeyRound, UserPlus, UserRound } from "lucide-react";
import DatePicker from "@/components/DatePicker";
import { FormSection } from "@/components/FormModal";
import { CinInput, TelephoneInput } from "@/components/FormatInput";
import LoadingButton from "@/components/LoadingButton";
import PasswordInput from "@/components/PasswordInput";
import PortailHeader from "@/components/proprietaire/PortailHeader";
import { Field } from "@/components/ui";
import { api } from "@/lib/api";

type Reponse = { identifiant: string; message: string };

export default function ProprietaireInscription() {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [inscrit, setInscrit] = useState<Reponse | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const saisie = new FormData(e.currentTarget);
    const texte = (champ: string) => String(saisie.get(champ) ?? "").trim();

    if (texte("mot_de_passe") !== texte("confirmation")) {
      setError("Les deux mots de passe ne sont pas identiques.");
      return;
    }

    const body: Record<string, string> = {};
    for (const champ of [
      "nom",
      "prenom",
      "telephone_principal",
      "email",
      "mot_de_passe",
      "cin",
      "date_naissance",
      "sexe",
      "adresse",
      "profession",
    ]) {
      if (texte(champ)) body[champ] = texte(champ);
    }

    setError(undefined);
    setLoading(true);
    try {
      setInscrit(await api<Reponse>("/auth/inscription", "POST", body));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (inscrit) {
    return (
      <>
        <PortailHeader />
        <main className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="card w-full max-w-lg p-10 text-center">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-accent/20 text-text-main">
              <Clock className="size-8" />
            </span>
            <h1 className="page-title mt-6">Inscription en attente de validation</h1>
            <p className="mt-3 text-text-muted">
              Merci ! Votre demande a bien été enregistrée. La mairie va vérifier vos informations
              avant d&apos;ouvrir votre compte.
            </p>
            <div className="mx-auto mt-6 w-fit rounded-md bg-background px-5 py-3">
              <p className="text-xs uppercase tracking-wider text-text-muted">
                Votre identifiant propriétaire
              </p>
              <p className="mt-1 font-mono text-xl font-bold tracking-wider text-primary">
                {inscrit.identifiant}
              </p>
            </div>
            <p className="mt-6 text-sm text-text-muted">
              Vous pourrez vous connecter dès que votre compte sera validé. Pensez à vous munir de
              votre CIN si la mairie vous contacte.
            </p>
            <Link href="/proprietaire" className="btn-ghost mt-8 inline-block">
              Retour à l&apos;accueil
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <PortailHeader
        actions={
          <Link href="/proprietaire/login" className="btn-ghost">
            Connexion
          </Link>
        }
      />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <div className="flex items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-md bg-primary/10 text-primary">
            <UserPlus className="size-6" />
          </span>
          <div>
            <h1 className="page-title">Créer mon compte propriétaire</h1>
            <p className="mt-1 text-sm text-text-muted">
              Votre compte sera ouvert après vérification par la mairie.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="card mt-8 p-0">
          <div className="space-y-8 p-8">
            {error && <p className="alert-error">{error}</p>}

            <FormSection title="Identité" icon={UserRound}>
              <Field label="Nom *">
                <input name="nom" required className="input-field" />
              </Field>
              <Field label="Prénom *">
                <input name="prenom" required className="input-field" />
              </Field>
              <Field label="CIN">
                <CinInput name="cin" />
              </Field>
              <Field label="Date de naissance">
                <DatePicker name="date_naissance" />
              </Field>
              <Field label="Sexe">
                <select name="sexe" defaultValue="" className="input-field">
                  <option value="">Non précisé</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </Field>
              <Field label="Profession">
                <input name="profession" className="input-field" />
              </Field>
              <Field label="Téléphone *">
                <TelephoneInput name="telephone_principal" required />
              </Field>
              <Field label="Adresse">
                <input
                  name="adresse"
                  placeholder="Lot, quartier, fokontany"
                  className="input-field"
                />
              </Field>
            </FormSection>

            <FormSection title="Connexion" icon={KeyRound}>
              <div className="sm:col-span-2">
                <Field label="Email *">
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="input-field"
                  />
                </Field>
              </div>
              <Field label="Mot de passe *">
                <PasswordInput
                  name="mot_de_passe"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="6 caractères minimum"
                  className="input-field"
                />
              </Field>
              <Field label="Confirmer le mot de passe *">
                <PasswordInput
                  name="confirmation"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="input-field"
                />
              </Field>
            </FormSection>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-b-lg border-t border-border bg-background px-8 py-5">
            <p className="text-sm text-text-muted">
              Déjà inscrit ?{" "}
              <Link href="/proprietaire/login" className="font-semibold text-primary">
                Se connecter
              </Link>
            </p>
            <LoadingButton type="submit" loading={loading} className="btn-primary">
              Envoyer ma demande
            </LoadingButton>
          </div>
        </form>
      </main>
    </>
  );
}
