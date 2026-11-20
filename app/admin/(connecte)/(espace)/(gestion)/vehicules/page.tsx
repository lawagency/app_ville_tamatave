"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRightLeft,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCog,
  UserMinus,
  UserRoundPen,
} from "lucide-react";
import { ConfirmDialog } from "@/components/Modal";
import { FilterTabs, PageHeader, RowActions } from "@/components/ui";
import TableVehicules from "@/components/vehicules/TableVehicules";
import VehiculeFormModal from "@/components/vehicules/VehiculeFormModal";
import {
  AttribuerChauffeurModal,
  ChangerProprietaireModal,
  ChangerStatutVehiculeModal,
} from "@/components/vehicules/VehiculeModals";
import { api } from "@/lib/api";
import { useAction } from "@/lib/useAction";
import type { Vehicule } from "@/types";
import { useVehiculesStore } from "@/stores";

type Filtre = "tous" | "en_regle" | "a_verifier" | "bloques";

const FILTRES: Record<Filtre, (v: Vehicule) => boolean> = {
  tous: () => true,
  en_regle: (v) => v.statut === "en_regle",
  a_verifier: (v) => v.statut === "en_attente_verification" || v.statut === "dossier_incomplet",
  bloques: (v) => ["immobilise", "suspendu", "radie"].includes(v.statut),
};

type Modale =
  | { type: "formulaire"; vehicule: Vehicule | null }
  | { type: "statut"; vehicule: Vehicule }
  | { type: "proprietaire"; vehicule: Vehicule }
  | { type: "chauffeur"; vehicule: Vehicule };

export default function VehiculesPage() {
  const router = useRouter();
  const vehicules = useVehiculesStore();
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState<Filtre>("tous");
  const [modale, setModale] = useState<Modale | null>(null);
  const [deleting, setDeleting] = useState<Vehicule | null>(null);
  const suppression = useAction();
  const action = useAction();

  useEffect(() => {
    useVehiculesStore.getState().fetchAll();
  }, []);

  const q = search.trim().toLowerCase();
  const compact = q.replace(/\s/g, "");
  const trouves = vehicules.items.filter(
    (v) =>
      v.immatriculation.toLowerCase().replace(/\s/g, "").includes(compact) ||
      [
        v.identifiant,
        v.nom,
        v.marque,
        v.modele,
        v.numero_chassis,
        v.proprietaire_nom,
        v.chauffeur_nom,
      ].some((x) => x?.toLowerCase().includes(q)),
  );
  const rows = trouves.filter(FILTRES[filtre]);
  const compte = (f: Filtre) => trouves.filter(FILTRES[f]).length;
  const ficheDe = (v: Vehicule) => `/admin/vehicules/${v.id}`;

  function retirerChauffeur(v: Vehicule) {
    return action.run(async () => {
      await api(`/vehicules/${v.id}/chauffeur`, "DELETE");
      await vehicules.fetchAll({ force: true });
    }, `${v.immatriculation} n'a plus de chauffeur`);
  }

  async function onDelete() {
    if (!deleting) return;
    const ok = await suppression.run(
      () => vehicules.remove(deleting.id),
      `Véhicule ${deleting.immatriculation} supprimé`,
    );
    if (ok) setDeleting(null);
  }

  const fermer = () => setModale(null);

  return (
    <>
      <PageHeader
        title="Véhicules"
        subtitle="Véhicules enregistrés, leur propriétaire et leur chauffeur"
        action={
          <button
            onClick={() => setModale({ type: "formulaire", vehicule: null })}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="size-4" />
            Nouveau véhicule
          </button>
        }
      />

      <TableVehicules
        loading={vehicules.loading}
        error={vehicules.error}
        rows={rows}
        lien={ficheDe}
        lienProprietaire={(id) => `/admin/proprietaires/${id}`}
        lienChauffeur={(id) => `/admin/chauffeurs/${id}`}
        toolbar={
          <div className="flex flex-wrap items-center justify-between gap-4">
            <FilterTabs
              value={filtre}
              onChange={setFiltre}
              tabs={[
                { key: "tous", label: "Tous", count: compte("tous"), tone: "primary" },
                { key: "en_regle", label: "En règle", count: compte("en_regle"), tone: "success" },
                {
                  key: "a_verifier",
                  label: "À vérifier",
                  count: compte("a_verifier"),
                  tone: "warning",
                },
                { key: "bloques", label: "Bloqués", count: compte("bloques"), tone: "danger" },
              ]}
            />
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Immatriculation, nom, identifiant, marque, propriétaire…"
                className="input-field pl-9"
              />
            </div>
          </div>
        }
        actions={(v) => (
          <RowActions
            actions={[
              { label: "Voir la fiche", icon: Eye, onClick: () => router.push(ficheDe(v)) },
              {
                label: "Modifier",
                icon: Pencil,
                onClick: () => setModale({ type: "formulaire", vehicule: v }),
              },
              {
                label: v.proprietaire_actuel_id
                  ? "Changer de propriétaire"
                  : "Attribuer un propriétaire",
                icon: UserRoundPen,
                onClick: () => setModale({ type: "proprietaire", vehicule: v }),
              },
              {
                label: v.chauffeur_actuel_id ? "Changer de chauffeur" : "Attribuer un chauffeur",
                icon: UserCog,
                onClick: () => setModale({ type: "chauffeur", vehicule: v }),
              },
              {
                label: "Retirer le chauffeur",
                icon: UserMinus,
                visible: !!v.chauffeur_actuel_id,
                onClick: () => retirerChauffeur(v),
              },
              // Un seul choix : le nouveau statut se sélectionne dans la fenêtre (8 statuts)
              {
                label: "Changer le statut",
                icon: ArrowRightLeft,
                onClick: () => setModale({ type: "statut", vehicule: v }),
              },
              {
                label: "Supprimer",
                icon: Trash2,
                variant: "danger",
                onClick: () => setDeleting(v),
              },
            ]}
          />
        )}
      />

      {modale?.type === "formulaire" && (
        <VehiculeFormModal
          key={modale.vehicule?.id ?? "nouveau"}
          vehicule={modale.vehicule}
          onClose={fermer}
        />
      )}
      {modale?.type === "statut" && (
        <ChangerStatutVehiculeModal vehicule={modale.vehicule} onClose={fermer} />
      )}
      {modale?.type === "proprietaire" && (
        <ChangerProprietaireModal vehicule={modale.vehicule} onClose={fermer} />
      )}
      {modale?.type === "chauffeur" && (
        <AttribuerChauffeurModal vehicule={modale.vehicule} espace="mairie" onClose={fermer} />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer le véhicule"
        message={
          <>
            Supprimer <strong>{deleting?.immatriculation}</strong> ? Son historique de propriétaires
            et de chauffeurs sera aussi supprimé. Pour garder la trace, passez-le plutôt en « radié
            ».
          </>
        }
        onConfirm={onDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
