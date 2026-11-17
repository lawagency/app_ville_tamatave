"use client";

import { useState, type ReactNode } from "react";
import { Building2, FileText, Phone } from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import { Field } from "@/components/ui";
import { fichierUrl } from "@/lib/api";
import { useAction } from "@/lib/useAction";
import type { Commune } from "@/types";
import { useCommunesStore } from "@/stores";
import LogoUpload from "./LogoUpload";

function Section({
  icon: Icon,
  titre,
  children,
}: {
  icon: typeof Building2;
  titre: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="mb-3 flex items-center gap-2 card-title">
        <Icon className="size-4 text-primary" />
        {titre}
      </legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

/** Formulaire unique des paramètres. Crée la commune si elle n'existe pas encore. */
export default function ParametresForm({ commune }: { commune?: Commune }) {
  const { create, update } = useCommunesStore();
  const [logoFichier, setLogoFichier] = useState<File | null>(null);
  const [logoRetire, setLogoRetire] = useState(false);
  const enregistrement = useAction();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const saisie = new FormData(e.currentTarget);
    const texte = (champ: string) => String(saisie.get(champ) ?? "").trim();

    // Envoi multipart : l'API récupère le fichier sous la clé « logo » (FileInterceptor)
    const body = new FormData();
    for (const champ of ["nom", "adresse", "telephone", "nif", "stat"]) {
      // Un champ vidé est envoyé vide pour être effacé
      body.append(champ, texte(champ));
    }
    // Email vide omis : l'API le refuserait (IsEmail)
    if (texte("email")) body.append("email", texte("email"));
    if (logoFichier) body.append("logo", logoFichier);
    else if (logoRetire) body.append("logo_chemin", "");

    const ok = await enregistrement.run(
      () => (commune ? update(commune.id, body) : create(body)),
      "Paramètres de la mairie enregistrés",
    );
    if (ok) {
      setLogoFichier(null);
      setLogoRetire(false);
    }
  }

  const valeur = (champ: keyof Commune) => (commune?.[champ] as string | null) ?? "";

  return (
    <form onSubmit={onSubmit} className="card p-0">
      {!commune && (
        <p className="alert-info m-6 mb-0">
          Aucune commune n&apos;est encore configurée : remplissez le formulaire pour la créer.
        </p>
      )}

      <div className="grid gap-8 p-6 lg:grid-cols-[1fr_auto] lg:p-8">
        <div className="space-y-8">
          <Section icon={Building2} titre="Identité de la mairie">
            <Field label="Nom de la commune *">
              <input
                name="nom"
                required
                defaultValue={valeur("nom")}
                placeholder="Commune urbaine de Toamasina"
                className="input-field"
              />
            </Field>
            <Field label="Adresse">
              <input
                name="adresse"
                defaultValue={valeur("adresse")}
                placeholder="Hôtel de ville, Toamasina 501"
                className="input-field"
              />
            </Field>
          </Section>

          <Section icon={Phone} titre="Contact">
            <Field label="Téléphone">
              <input
                name="telephone"
                type="tel"
                defaultValue={valeur("telephone")}
                placeholder="+261 20 53 000 00"
                className="input-field"
              />
            </Field>
            <Field label="Email">
              <input
                name="email"
                type="email"
                defaultValue={valeur("email")}
                placeholder="contact@toamasina.mg"
                className="input-field"
              />
            </Field>
          </Section>

          <Section icon={FileText} titre="Informations fiscales">
            <Field label="NIF">
              <input
                name="nif"
                defaultValue={valeur("nif")}
                placeholder="Numéro d'identification fiscale"
                className="input-field"
              />
            </Field>
            <Field label="STAT">
              <input
                name="stat"
                defaultValue={valeur("stat")}
                placeholder="Numéro statistique"
                className="input-field"
              />
            </Field>
          </Section>
        </div>

        <div className="lg:w-72 lg:border-l lg:border-border lg:pl-8">
          <p className="card-title mb-4">Logo</p>
          <LogoUpload
            actuel={fichierUrl(commune?.logo_chemin)}
            fichier={logoFichier}
            onFichierChange={setLogoFichier}
            retire={logoRetire}
            onRetireChange={setLogoRetire}
          />
        </div>
      </div>

      <div className="flex justify-end border-t border-border px-6 py-4 lg:px-8">
        <LoadingButton type="submit" loading={enregistrement.pending} className="btn-primary">
          Enregistrer
        </LoadingButton>
      </div>
    </form>
  );
}
