"use client";

import { useState } from "react";
import {
  Briefcase,
  CalendarDays,
  Car,
  IdCard,
  Info,
  Mail,
  MapPin,
  Phone,
  Tag,
  Timer,
  UserRound,
} from "lucide-react";
import DatePicker from "@/components/DatePicker";
import { CinInput, TelephoneInput } from "@/components/FormatInput";
import FormModal, { FormSection } from "@/components/FormModal";
import PhotoInput from "@/components/PhotoInput";
import {
  CarteCompletion,
  CarteProfil,
  CarteStatut,
  EnteteProfil,
  Ligne,
} from "@/components/portail/ProfilElements";
import Skeleton from "@/components/Skeleton";
import { Field } from "@/components/ui";
import { fichierUrl, formatDate } from "@/lib/api";
import { afficherTelephone, formaterCin } from "@/lib/formats";
import {
  A_COMPLETER_CHAUFFEUR,
  completionChauffeur,
  statutDuChauffeur,
} from "@/lib/maFicheChauffeur";
import { useAction } from "@/lib/useAction";
import { situationDe } from "@/types";
import { useMaFicheChauffeurStore } from "@/stores";

// Champs acceptés par PATCH /chauffeurs/moi (MonProfilChauffeurDto)
const CHAMPS_ENVOYES = ["cin", "date_naissance", "lieu_naissance", "telephone", "adresse"];

/** Fiche du chauffeur connecté : présentation, consultation, modification. */
export default function MonProfilChauffeur() {
  const { fiche, error: erreur, modifier, envoyerPhoto } = useMaFicheChauffeurStore();
  const [formOpen, setFormOpen] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const enregistrement = useAction();

  if (erreur) return <p className="alert-error">{erreur}</p>;
  if (!fiche) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-56 w-full" />
        <div className="grid gap-6 xl:grid-cols-3">
          <Skeleton className="h-80 xl:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const { manquants, pct } = completionChauffeur(fiche);
  const statut = statutDuChauffeur(fiche);
  const nom = `${fiche.prenom} ${fiche.nom.toUpperCase()}`;

  function ouvrir() {
    setPhoto(null);
    setFormOpen(true);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const saisie = new FormData(e.currentTarget);
    const body: Record<string, string> = {};
    for (const champ of CHAMPS_ENVOYES) {
      const v = String(saisie.get(champ) ?? "").trim();
      // La date est validée par format : omise si vide
      if (v || champ !== "date_naissance") body[champ] = v;
    }
    const ok = await enregistrement.run(async () => {
      await modifier(body);
      if (photo) await envoyerPhoto(photo);
    }, "Votre profil a été mis à jour");
    if (ok) setFormOpen(false);
  }

  return (
    <div className="space-y-6">
      <EnteteProfil
        nom={nom}
        photo={fichierUrl(fiche.photo_chemin)}
        identifiant={fiche.identifiant}
        statut={statut}
        date={fiche.date_enregistrement ?? fiche.created_at}
        dateLabel="Enregistré le"
        aCompleter={manquants.length > 0}
        onModifier={ouvrir}
      />

      <div className="grid items-start gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <CarteProfil titre="Identité" icon={UserRound}>
            <Ligne label="Nom" valeur={fiche.nom.toUpperCase()} icon={UserRound} verrouille />
            <Ligne label="Prénom" valeur={fiche.prenom} icon={UserRound} verrouille />
            <Ligne label="CIN" valeur={formaterCin(fiche.cin)} icon={IdCard} onCompleter={ouvrir} />
            <Ligne
              label="Date de naissance"
              valeur={fiche.date_naissance ? formatDate(fiche.date_naissance) : null}
              icon={CalendarDays}
              onCompleter={ouvrir}
            />
            <Ligne
              label="Lieu de naissance"
              valeur={fiche.lieu_naissance}
              icon={MapPin}
              onCompleter={ouvrir}
            />
          </CarteProfil>

          <CarteProfil titre="Coordonnées" icon={Phone}>
            <Ligne
              label="Téléphone"
              valeur={afficherTelephone(fiche.telephone)}
              icon={Phone}
              onCompleter={ouvrir}
            />
            <Ligne label="Email" valeur={fiche.email} icon={Mail} verrouille />
            <Ligne label="Adresse" valeur={fiche.adresse} icon={MapPin} onCompleter={ouvrir} />
          </CarteProfil>

          {/* Décidé par la mairie et le propriétaire : lecture seule */}
          <CarteProfil titre="Activité" icon={Briefcase}>
            <Ligne
              label="Type de chauffeur"
              valeur={fiche.type_chauffeur_nom}
              icon={Tag}
              verrouille
            />
            <Ligne
              label="Type de véhicule"
              valeur={fiche.type_vehicule_nom}
              icon={Car}
              verrouille
            />
            <Ligne
              label="Employeur"
              valeur={
                fiche.proprietaire_nom &&
                `${fiche.proprietaire_nom} · ${fiche.proprietaire_identifiant}`
              }
              icon={Briefcase}
              verrouille
            />
            <Ligne
              label="Situation"
              valeur={fiche.est_blackliste ? "Liste noire" : situationDe(fiche).label}
              icon={Timer}
              verrouille
            />
          </CarteProfil>
        </div>

        <aside className="space-y-6">
          <CarteCompletion
            champs={A_COMPLETER_CHAUFFEUR}
            manquants={manquants}
            pct={pct}
            onCompleter={ouvrir}
          />
          <CarteStatut statut={statut} explication={statut.texte} />

          <p className="flex items-start gap-2 px-1 text-xs text-text-muted">
            <Info className="mt-0.5 size-4 shrink-0" />
            Nom, prénom, email et type de chauffeur sont gérés par la mairie, la situation par votre
            propriétaire. Pour les corriger, présentez-vous à la mairie avec votre CIN.
          </p>
        </aside>
      </div>

      <FormModal
        open={formOpen}
        centrage="ecran"
        size="lg"
        title="Mon profil"
        subtitle="Nom, prénom et email sont gérés par la mairie."
        onClose={() => setFormOpen(false)}
        onSubmit={onSubmit}
        submitLabel="Enregistrer"
        pending={enregistrement.pending}
        formKey={fiche.id}
      >
        <PhotoInput actuelle={fichierUrl(fiche.photo_chemin)} fichier={photo} onChange={setPhoto} />

        <FormSection columns={3} title="Identité" icon={UserRound}>
          <Field label="CIN">
            <CinInput name="cin" defaultValue={fiche.cin} />
          </Field>
          <Field label="Date de naissance">
            <DatePicker name="date_naissance" defaultValue={fiche.date_naissance} />
          </Field>
          <Field label="Lieu de naissance">
            <input
              name="lieu_naissance"
              defaultValue={fiche.lieu_naissance ?? ""}
              className="input-field"
            />
          </Field>
        </FormSection>

        <FormSection columns={2} title="Contact" icon={IdCard}>
          <Field label="Téléphone *">
            <TelephoneInput name="telephone" required defaultValue={fiche.telephone} />
          </Field>
          <Field label="Adresse">
            <input
              name="adresse"
              defaultValue={fiche.adresse ?? ""}
              placeholder="Lot, quartier, fokontany"
              className="input-field"
            />
          </Field>
        </FormSection>

        <p className="flex items-start gap-2 text-xs text-text-muted">
          <IdCard className="mt-0.5 size-4 shrink-0" />
          Pour corriger votre nom, prénom ou email, adressez-vous à la mairie avec votre CIN.
        </p>
      </FormModal>
    </div>
  );
}
