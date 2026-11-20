"use client";

import { useEffect, useState } from "react";
import { Car, Hash, NotebookPen, UserRound, Wrench } from "lucide-react";
import DatePicker from "@/components/DatePicker";
import FormModal, { FormSection } from "@/components/FormModal";
import PhotoInput from "@/components/PhotoInput";
import { Field } from "@/components/ui";
import { api, fichierUrl } from "@/lib/api";
import { useAction } from "@/lib/useAction";
import type { OptionsVehicule, Vehicule } from "@/types";
import { useChauffeursStore, useMesChauffeursStore, useProprietairesStore } from "@/stores";
import {
  attribuables,
  libelleChauffeur,
  routesVehicule,
  type EspaceVehicule,
} from "./VehiculeModals";

const CHAMPS_TEXTE = [
  "immatriculation",
  "nom",
  "marque",
  "modele",
  "couleur",
  "numero_chassis",
  "notes",
];

/**
 * Corps envoyé à l'API. En modification, un champ vidé est envoyé vide pour être effacé ;
 * à la création, il est omis.
 */
function corpsDuFormulaire(form: HTMLFormElement, creation: boolean) {
  const saisie = new FormData(form);
  const texte = (champ: string) => String(saisie.get(champ) ?? "").trim();
  const nombre = (champ: string) => (texte(champ) ? Number(texte(champ)) : null);
  const body: Record<string, string | number | null> = { type_id: Number(texte("type_id")) };

  for (const champ of CHAMPS_TEXTE) {
    if (texte(champ) || !creation) body[champ] = texte(champ);
  }
  if (texte("date_premiere_circulation")) {
    body.date_premiere_circulation = texte("date_premiere_circulation");
  }
  // Catégorie facultative : null en modification pour l'enlever
  if (nombre("categorie_id") !== null || !creation) body.categorie_id = nombre("categorie_id");
  // Propriétaire et chauffeur : seulement à la création (ensuite, actions dédiées)
  if (creation) {
    for (const champ of ["proprietaire_id", "chauffeur_id"]) {
      if (nombre(champ) !== null) body[champ] = nombre(champ);
    }
  }
  return body;
}

type Props = {
  /** `null` : enregistrement d'un nouveau véhicule. */
  vehicule: Vehicule | null;
  /** `mairie` (par défaut) ou `proprietaire` : le propriétaire connecté ajoute son véhicule. */
  espace?: EspaceVehicule;
  onClose: () => void;
  onSaved?: (v: Vehicule) => void;
};

/** Formulaire d'enregistrement / modification d'un véhicule. À monter seulement quand il est ouvert. */
export default function VehiculeFormModal({
  vehicule: editing,
  espace = "mairie",
  onClose,
  onSaved,
}: Props) {
  const mairie = espace === "mairie";
  const { chemin, store } = routesVehicule(espace);
  const [options, setOptions] = useState<OptionsVehicule>({ types: [], categories: [] });
  const [prochain, setProchain] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [proprietaireId, setProprietaireId] = useState("");
  const [typeId, setTypeId] = useState(String(editing?.type_id ?? ""));
  const proprietaires = useProprietairesStore((s) => s.items);
  const tousChauffeurs = useChauffeursStore((s) => s.items);
  const mesChauffeurs = useMesChauffeursStore((s) => s.items);
  const enregistrement = useAction();

  useEffect(() => {
    api<OptionsVehicule>(`${chemin}/options`)
      .then(setOptions)
      .catch(() => setOptions({ types: [], categories: [] }));
  }, [chemin]);

  // Listes de propriétaires et chauffeurs : seulement à la création
  useEffect(() => {
    if (editing) return;
    if (mairie) {
      useProprietairesStore.getState().fetchAll();
      useChauffeursStore.getState().fetchAll();
    } else {
      useMesChauffeursStore.getState().fetchAll();
    }
    // Aperçu seulement : l'API attribue l'identifiant à l'enregistrement
    api<{ identifiant: string }>("/parametres-indentifiants/prochain/vehicule")
      .then((r) => setProchain(r.identifiant))
      .catch(() => setProchain(null));
  }, [editing, mairie]);

  // Chauffeurs dont le type conduit le type choisi ; ceux du propriétaire choisi en premier
  const chauffeurs = attribuables(mairie ? tousChauffeurs : mesChauffeurs, typeId).sort(
    (a, b) =>
      Number(String(b.proprietaire_id) === proprietaireId) -
      Number(String(a.proprietaire_id) === proprietaireId),
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = corpsDuFormulaire(e.currentTarget, !editing);
    const { create, update, fetchAll } = store.getState();
    let enregistre: Vehicule | null = null;
    const ok = await enregistrement.run(
      async () => {
        enregistre = editing ? await update(editing.id, body) : await create(body);
        // La photo part après la fiche : sa route a besoin de l'id et de l'identifiant
        if (photo) {
          const envoi = new FormData();
          envoi.append("photo", photo);
          enregistre = await api<Vehicule>(`${chemin}/${enregistre.id}/photo`, "POST", envoi);
          await fetchAll({ force: true });
        }
      },
      editing ? "Véhicule modifié" : `Véhicule ${body.immatriculation} enregistré`,
    );
    if (ok && enregistre) {
      onSaved?.(enregistre);
      onClose();
    }
  }

  // Un type ou une catégorie désactivé reste proposé s'il est déjà choisi
  const types = [...options.types];
  if (editing?.type_id && !types.some((t) => Number(t.id) === Number(editing.type_id))) {
    types.push({ id: editing.type_id, nom: editing.type_nom ?? "Type désactivé" });
  }
  const categories = [...options.categories];
  if (
    editing?.categorie_id &&
    !categories.some((c) => Number(c.id) === Number(editing.categorie_id))
  ) {
    categories.push({
      id: editing.categorie_id,
      nom: editing.categorie_nom ?? "Catégorie désactivée",
    });
  }

  return (
    <FormModal
      size="lg"
      open
      title={editing ? "Modifier le véhicule" : mairie ? "Nouveau véhicule" : "Ajouter un véhicule"}
      subtitle={
        editing
          ? editing.immatriculation
          : mairie
            ? "Les champs marqués * sont obligatoires."
            : "La mairie vérifiera le véhicule avant de le valider."
      }
      onClose={onClose}
      onSubmit={onSubmit}
      submitLabel={editing ? "Enregistrer" : "Enregistrer le véhicule"}
      pending={enregistrement.pending}
      formKey={editing?.id ?? "nouveau"}
    >
      <PhotoInput
        actuelle={fichierUrl(editing?.photo_chemin)}
        fichier={photo}
        onChange={setPhoto}
        aide="Photo du véhicule, JPEG, PNG ou WebP."
        icon={Car}
      />

      <FormSection columns={3} title="Véhicule" icon={Car}>
        <Field label="Immatriculation *">
          <input
            name="immatriculation"
            required
            defaultValue={editing?.immatriculation}
            placeholder="1234 TBA"
            className="input-field uppercase"
          />
        </Field>
        <Field label="Type *">
          {/* La clé remonte la liste quand les options arrivent, pour garder la valeur choisie */}
          <select
            key={`t-${types.length}`}
            name="type_id"
            required
            defaultValue={editing?.type_id ?? ""}
            onChange={(e) => setTypeId(e.target.value)}
            className="input-field"
          >
            <option value="" disabled>
              {types.length ? "Choisir…" : "Aucun type de véhicule"}
            </option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nom}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Catégorie">
          <select
            key={`c-${categories.length}`}
            name="categorie_id"
            defaultValue={editing?.categorie_id ?? ""}
            className="input-field"
          >
            <option value="">Aucune</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Marque">
          <input name="marque" defaultValue={editing?.marque ?? ""} className="input-field" />
        </Field>
        <Field label="Modèle">
          <input name="modele" defaultValue={editing?.modele ?? ""} className="input-field" />
        </Field>
        <Field label="Couleur">
          <input name="couleur" defaultValue={editing?.couleur ?? ""} className="input-field" />
        </Field>
      </FormSection>

      <FormSection title="Identification" icon={Wrench}>
        <Field label="Nom du véhicule">
          <input
            name="nom"
            defaultValue={editing?.nom ?? ""}
            placeholder="Facultatif, ex. « Le Rapide »"
            className="input-field"
          />
        </Field>
        <Field label="Identifiant">
          <div className="input-field flex items-center gap-2 bg-background">
            <Hash className="size-4 shrink-0 text-text-muted" />
            {editing ? (
              <code className="font-mono font-semibold text-primary">{editing.identifiant}</code>
            ) : prochain ? (
              <>
                <code className="font-mono font-semibold text-primary">{prochain}</code>
                <span className="text-xs text-text-muted">attribué automatiquement</span>
              </>
            ) : (
              <span className="text-sm text-text-muted">Attribué automatiquement</span>
            )}
          </div>
        </Field>
        <Field label="Numéro de châssis">
          <input
            name="numero_chassis"
            defaultValue={editing?.numero_chassis ?? ""}
            className="input-field font-mono uppercase"
          />
        </Field>
        <Field label="1re mise en circulation">
          <DatePicker
            name="date_premiere_circulation"
            defaultValue={editing?.date_premiere_circulation}
          />
        </Field>
      </FormSection>

      {/* Propriétaire et chauffeur à la création ; ensuite, depuis la fiche du véhicule */}
      {!editing && (
        <FormSection title={mairie ? "Propriétaire et chauffeur" : "Chauffeur"} icon={UserRound}>
          {mairie && (
            <Field label="Propriétaire">
              <select
                key={`p-${proprietaires.length}`}
                name="proprietaire_id"
                value={proprietaireId}
                onChange={(e) => setProprietaireId(e.target.value)}
                className="input-field"
              >
                <option value="">Aucun pour l&apos;instant</option>
                {proprietaires.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.prenom} {p.nom.toUpperCase()} · {p.identifiant}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Chauffeur">
            {/* Recréée au changement de type : un chauffeur d'un autre type ne reste pas choisi */}
            <select
              key={`ch-${typeId}-${chauffeurs.length}`}
              name="chauffeur_id"
              defaultValue=""
              disabled={!typeId}
              className="input-field"
            >
              <option value="">
                {!typeId
                  ? "Choisissez d'abord le type"
                  : chauffeurs.length
                    ? "Aucun pour l'instant"
                    : "Aucun chauffeur pour ce type"}
              </option>
              {chauffeurs.map((c) => (
                <option key={c.id} value={c.id}>
                  {libelleChauffeur(c)}
                </option>
              ))}
            </select>
          </Field>
        </FormSection>
      )}

      <FormSection title="Notes" icon={NotebookPen} columns={1}>
        <textarea
          name="notes"
          rows={2}
          defaultValue={editing?.notes ?? ""}
          placeholder="Informations utiles pour la mairie"
          aria-label="Notes"
          className="input-field"
        />
      </FormSection>
    </FormModal>
  );
}
