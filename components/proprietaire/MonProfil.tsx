"use client";

import { useState } from "react";
import {
  Ban,
  Briefcase,
  CalendarDays,
  CircleCheck,
  CircleMinus,
  CircleX,
  Clock,
  FileWarning,
  IdCard,
  Info,
  Mail,
  MapPin,
  Phone,
  PhoneCall,
  UserRound,
  VenusAndMars,
  type LucideIcon,
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
import { A_COMPLETER, completion } from "@/lib/maFiche";
import { useAction } from "@/lib/useAction";
import { STATUTS_FICHE, type StatutFiche } from "@/types";
import { useMaFicheStore } from "@/stores";

const CHAMPS_ENVOYES = [
  "cin",
  "date_naissance",
  "lieu_naissance",
  "sexe",
  "profession",
  "telephone_principal",
  "telephone_secondaire",
  "adresse",
];

/** Ce que chaque statut signifie pour le propriétaire. */
const EXPLICATIONS: Record<StatutFiche, { icon: LucideIcon; texte: string }> = {
  en_verification: {
    icon: Clock,
    texte: "La mairie vérifie vos informations et vos pièces. Vous serez informé du résultat.",
  },
  dossier_incomplet: {
    icon: FileWarning,
    texte:
      "Il manque des informations ou des pièces. Complétez votre profil ou passez à la mairie.",
  },
  actif: {
    icon: CircleCheck,
    texte: "Votre dossier a été vérifié et validé par la mairie.",
  },
  suspendu: {
    icon: Ban,
    texte: "Votre dossier est suspendu. Rapprochez-vous de la mairie pour en connaître la raison.",
  },
  inactif: {
    icon: CircleMinus,
    texte: "Votre dossier n'est plus actif. Contactez la mairie pour le réactiver.",
  },
  radie: {
    icon: CircleX,
    texte: "Votre dossier a été radié. Contactez la mairie pour plus d'informations.",
  },
};

/** Fiche du propriétaire connecté : panel de présentation, consultation, modification. */
export default function MonProfil() {
  const { fiche, error: erreur, modifier, envoyerPhoto } = useMaFicheStore();
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

  const { manquants, pct } = completion(fiche);
  const cleStatut = fiche.statut ?? "en_verification";
  const statut = { ...STATUTS_FICHE[cleStatut], icon: EXPLICATIONS[cleStatut].icon };
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
      // Date et sexe sont validés par format : omis s'ils sont vides
      if (v || !["date_naissance", "sexe"].includes(champ)) body[champ] = v;
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
        date={fiche.created_at}
        dateLabel="Inscrit le"
        aCompleter={manquants.length > 0}
        onModifier={ouvrir}
      />

      <div className="grid items-start gap-6 xl:grid-cols-3">
        {/* Informations déclarées */}
        <div className="space-y-6 xl:col-span-2">
          <CarteProfil titre="Identité" icon={UserRound}>
            <Ligne label="Nom" valeur={fiche.nom.toUpperCase()} icon={UserRound} verrouille />
            <Ligne label="Prénom" valeur={fiche.prenom} icon={UserRound} verrouille />
            <Ligne label="CIN" valeur={formaterCin(fiche.cin)} icon={IdCard} onCompleter={ouvrir} />
            <Ligne
              label="Sexe"
              valeur={fiche.sexe === "M" ? "Masculin" : fiche.sexe === "F" ? "Féminin" : null}
              icon={VenusAndMars}
              onCompleter={ouvrir}
            />
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
            <Ligne
              label="Profession"
              valeur={fiche.profession}
              icon={Briefcase}
              onCompleter={ouvrir}
            />
          </CarteProfil>

          <CarteProfil titre="Coordonnées" icon={Phone}>
            <Ligne
              label="Téléphone principal"
              valeur={afficherTelephone(fiche.telephone_principal)}
              icon={Phone}
              onCompleter={ouvrir}
            />
            <Ligne
              label="Téléphone secondaire"
              valeur={afficherTelephone(fiche.telephone_secondaire)}
              icon={PhoneCall}
              onCompleter={ouvrir}
            />
            <Ligne label="Email" valeur={fiche.email} icon={Mail} verrouille />
            <Ligne label="Adresse" valeur={fiche.adresse} icon={MapPin} onCompleter={ouvrir} />
          </CarteProfil>
        </div>

        <aside className="space-y-6">
          <CarteCompletion
            champs={A_COMPLETER}
            manquants={manquants}
            pct={pct}
            onCompleter={ouvrir}
          />
          <CarteStatut statut={statut} explication={EXPLICATIONS[cleStatut].texte} />

          <p className="flex items-start gap-2 px-1 text-xs text-text-muted">
            <Info className="mt-0.5 size-4 shrink-0" />
            Nom, prénom et email sont gérés par la mairie. Pour les corriger, présentez-vous avec
            votre CIN.
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
          <Field label="Sexe">
            <select name="sexe" defaultValue={fiche.sexe ?? ""} className="input-field">
              <option value="">Non précisé</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </Field>
          <Field label="Profession">
            <input
              name="profession"
              defaultValue={fiche.profession ?? ""}
              className="input-field"
            />
          </Field>
        </FormSection>

        <FormSection columns={2} title="Contact" icon={IdCard}>
          <Field label="Téléphone *">
            <TelephoneInput
              name="telephone_principal"
              required
              defaultValue={fiche.telephone_principal}
            />
          </Field>
          <Field label="Téléphone secondaire">
            <TelephoneInput name="telephone_secondaire" defaultValue={fiche.telephone_secondaire} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Adresse">
              <input
                name="adresse"
                defaultValue={fiche.adresse ?? ""}
                placeholder="Lot, quartier, fokontany"
                className="input-field"
              />
            </Field>
          </div>
        </FormSection>

        <p className="flex items-start gap-2 text-xs text-text-muted">
          <IdCard className="mt-0.5 size-4 shrink-0" />
          Pour corriger votre nom, prénom ou email, adressez-vous à la mairie avec votre CIN.
        </p>
      </FormModal>
    </div>
  );
}
