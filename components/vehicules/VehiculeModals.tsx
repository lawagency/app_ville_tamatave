"use client";

import { useEffect, useState } from "react";
import {
  Ban,
  CircleCheck,
  CircleX,
  Clock,
  FileWarning,
  OctagonPause,
  RefreshCw,
  TimerOff,
  type LucideIcon,
} from "lucide-react";
import FormModal from "@/components/FormModal";
import { Field } from "@/components/ui";
import { api } from "@/lib/api";
import { useAction } from "@/lib/useAction";
import { STATUTS_VEHICULE, type Chauffeur, type StatutVehicule, type Vehicule } from "@/types";
import {
  useChauffeursStore,
  useMesChauffeursStore,
  useMesVehiculesStore,
  useProprietairesStore,
  useVehiculesStore,
} from "@/stores";

/** Action qui fait passer le véhicule à ce statut (menus, liste déroulante). */
export const ACTIONS_STATUT_VEHICULE: Record<
  StatutVehicule,
  { label: string; icon: LucideIcon; variant?: "success" | "danger" }
> = {
  en_regle: { label: "Déclarer en règle", icon: CircleCheck, variant: "success" },
  en_attente_verification: { label: "Remettre en vérification", icon: Clock },
  dossier_incomplet: { label: "Dossier incomplet", icon: FileWarning },
  document_expire: { label: "Document expiré", icon: TimerOff },
  autorisation_a_renouveler: { label: "Autorisation à renouveler", icon: RefreshCw },
  immobilise: { label: "Immobiliser", icon: OctagonPause, variant: "danger" },
  suspendu: { label: "Suspendre", icon: Ban, variant: "danger" },
  radie: { label: "Radier", icon: CircleX, variant: "danger" },
};

export type EspaceVehicule = "mairie" | "proprietaire";

/** Routes et store selon l'espace : `/vehicules` (mairie) ou `/vehicules/mes-vehicules`. */
export const routesVehicule = (espace: EspaceVehicule) =>
  espace === "mairie"
    ? { chemin: "/vehicules", store: useVehiculesStore }
    : { chemin: "/vehicules/mes-vehicules", store: useMesVehiculesStore };

/**
 * Changement de statut par la mairie, avec la justification gardée dans l'historique.
 * Sans `statut` imposé, le nouveau statut se choisit dans la fenêtre.
 */
export function ChangerStatutVehiculeModal({
  vehicule,
  statut: impose,
  onClose,
  onDone,
}: {
  vehicule: Vehicule;
  statut?: StatutVehicule;
  onClose: () => void;
  onDone?: (v: Vehicule) => void;
}) {
  const changement = useAction();
  const autres = (Object.keys(STATUTS_VEHICULE) as StatutVehicule[]).filter(
    (s) => s !== vehicule.statut,
  );
  const [choisi, setChoisi] = useState<StatutVehicule>(impose ?? autres[0]);
  const statut = impose ?? choisi;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const justification = String(new FormData(e.currentTarget).get("justification") ?? "").trim();
    let v: Vehicule | null = null;
    const ok = await changement.run(async () => {
      v = await useVehiculesStore
        .getState()
        .update(vehicule.id, { statut, justification_statut: justification });
    }, `${vehicule.immatriculation} : ${STATUTS_VEHICULE[statut].label.toLowerCase()}`);
    if (ok && v) {
      onDone?.(v);
      onClose();
    }
  }

  return (
    <FormModal
      size="sm"
      open
      title={impose ? ACTIONS_STATUT_VEHICULE[impose].label : "Changer le statut"}
      subtitle={`${vehicule.immatriculation} : ${STATUTS_VEHICULE[vehicule.statut].label} → ${STATUTS_VEHICULE[statut].label}`}
      onClose={onClose}
      onSubmit={onSubmit}
      submitLabel="Changer le statut"
      pending={changement.pending}
      formKey={`${vehicule.id}-${impose ?? "choix"}`}
    >
      {!impose && (
        <Field label="Nouveau statut *">
          <select
            value={choisi}
            onChange={(e) => setChoisi(e.target.value as StatutVehicule)}
            className="input-field"
          >
            {autres.map((s) => (
              <option key={s} value={s}>
                {STATUTS_VEHICULE[s].label}
              </option>
            ))}
          </select>
        </Field>
      )}
      <Field label="Justification *">
        <textarea
          name="justification"
          rows={3}
          required
          placeholder="Raison du changement, conservée dans l'historique du véhicule"
          className="input-field"
        />
      </Field>
    </FormModal>
  );
}

/** Changement de propriétaire au guichet (hors vente) : l'ancienne propriété est close. */
export function ChangerProprietaireModal({
  vehicule,
  onClose,
  onDone,
}: {
  vehicule: Vehicule;
  onClose: () => void;
  onDone?: (v: Vehicule) => void;
}) {
  const proprietaires = useProprietairesStore((s) => s.items);
  const action = useAction();

  useEffect(() => {
    useProprietairesStore.getState().fetchAll();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const proprietaire_id = Number(new FormData(e.currentTarget).get("proprietaire_id"));
    let v: Vehicule | null = null;
    const ok = await action.run(async () => {
      v = await api<Vehicule>(`/vehicules/${vehicule.id}/proprietaire`, "POST", {
        proprietaire_id,
      });
      await useVehiculesStore.getState().fetchAll({ force: true });
    }, `Nouveau propriétaire pour ${vehicule.immatriculation}`);
    if (ok && v) {
      onDone?.(v);
      onClose();
    }
  }

  return (
    <FormModal
      size="sm"
      open
      title={
        vehicule.proprietaire_actuel_id ? "Changer de propriétaire" : "Attribuer un propriétaire"
      }
      subtitle={vehicule.immatriculation}
      onClose={onClose}
      onSubmit={onSubmit}
      submitLabel="Enregistrer"
      pending={action.pending}
      formKey={`${vehicule.id}-proprietaire`}
    >
      <Field label="Nouveau propriétaire *">
        {/* La clé remonte la liste quand les propriétaires arrivent */}
        <select
          key={proprietaires.length}
          name="proprietaire_id"
          required
          defaultValue=""
          className="input-field"
        >
          <option value="" disabled>
            {proprietaires.length ? "Choisir…" : "Chargement…"}
          </option>
          {proprietaires
            .filter((p) => Number(p.id) !== Number(vehicule.proprietaire_actuel_id))
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.prenom} {p.nom.toUpperCase()} · {p.identifiant}
              </option>
            ))}
        </select>
      </Field>
      <p className="text-xs text-text-muted">
        Pour une vente, utilisez plutôt la procédure de vente (bientôt). Ce changement est noté
        comme une correction dans l&apos;historique des propriétaires.
      </p>
    </FormModal>
  );
}

/**
 * Chauffeurs qui peuvent conduire ce type de véhicule : leur type de chauffeur
 * (Configuration → Types de chauffeurs) est rattaché à ce type ; ni liste noire ni radiés.
 */
export const attribuables = (
  chauffeurs: Chauffeur[],
  typeVehiculeId: number | string | null,
  actuelId: number | null = null,
) =>
  chauffeurs.filter(
    (c) =>
      !c.est_blackliste &&
      c.statut !== "radie" &&
      Number(c.id) !== Number(actuelId) &&
      (!typeVehiculeId || Number(c.type_vehicule_id) === Number(typeVehiculeId)),
  );

/** « Jean RAKOTO · CHAUF-0001 (Joker) » */
export const libelleChauffeur = (c: Chauffeur) =>
  `${c.prenom} ${c.nom.toUpperCase()} · ${c.identifiant}${c.type_chauffeur_nom ? ` (${c.type_chauffeur_nom})` : ""}`;

/**
 * Nouveau chauffeur du véhicule. La mairie choisit parmi tous les chauffeurs,
 * le propriétaire parmi les siens (Mes chauffeurs).
 */
export function AttribuerChauffeurModal({
  vehicule,
  espace,
  onClose,
  onDone,
}: {
  vehicule: Vehicule;
  espace: EspaceVehicule;
  onClose: () => void;
  onDone?: (v: Vehicule) => void;
}) {
  const mairie = espace === "mairie";
  const tousChauffeurs = useChauffeursStore((s) => s.items);
  const mesChauffeurs = useMesChauffeursStore((s) => s.items);
  const action = useAction();
  const { chemin, store } = routesVehicule(espace);

  useEffect(() => {
    (mairie ? useChauffeursStore : useMesChauffeursStore).getState().fetchAll();
  }, [mairie]);

  const chauffeurs = attribuables(
    mairie ? tousChauffeurs : mesChauffeurs,
    vehicule.type_id,
    vehicule.chauffeur_actuel_id,
  );
  const typeVehicule = vehicule.type_nom?.toLowerCase() ?? "ce type de véhicule";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const chauffeur_id = Number(new FormData(e.currentTarget).get("chauffeur_id"));
    let v: Vehicule | null = null;
    const ok = await action.run(async () => {
      v = await api<Vehicule>(`${chemin}/${vehicule.id}/chauffeur`, "POST", { chauffeur_id });
      await store.getState().fetchAll({ force: true });
    }, `Chauffeur attribué à ${vehicule.immatriculation}`);
    if (ok && v) {
      onDone?.(v);
      onClose();
    }
  }

  return (
    <FormModal
      size="sm"
      open
      title={vehicule.chauffeur_actuel_id ? "Changer de chauffeur" : "Attribuer un chauffeur"}
      subtitle={vehicule.immatriculation}
      onClose={onClose}
      onSubmit={onSubmit}
      submitLabel="Attribuer"
      pending={action.pending}
      formKey={`${vehicule.id}-chauffeur`}
    >
      <Field label="Chauffeur *">
        <select
          key={chauffeurs.length}
          name="chauffeur_id"
          required
          defaultValue=""
          className="input-field"
        >
          <option value="" disabled>
            {chauffeurs.length
              ? "Choisir…"
              : `Aucun chauffeur pour ${typeVehicule}${mairie ? "" : " parmi vos chauffeurs"}`}
          </option>
          {chauffeurs.map((c) => (
            <option key={c.id} value={c.id}>
              {libelleChauffeur(c)}
            </option>
          ))}
        </select>
      </Field>
      <p className="text-xs text-text-muted">
        Seuls les chauffeurs dont le type conduit {typeVehicule} sont proposés.
      </p>
      {vehicule.chauffeur_nom && (
        <p className="text-xs text-text-muted">
          {vehicule.chauffeur_nom} ne conduira plus ce véhicule : son attribution sera close.
        </p>
      )}
      {!mairie && <p className="text-xs text-text-muted">La mairie validera cette attribution.</p>}
    </FormModal>
  );
}
