"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Info, Pencil, Plus, UserCog } from "lucide-react";
import { RowActions } from "@/components/ui";
import TableVehicules from "@/components/vehicules/TableVehicules";
import VehiculeFormModal from "@/components/vehicules/VehiculeFormModal";
import { AttribuerChauffeurModal } from "@/components/vehicules/VehiculeModals";
import { peutVoir } from "@/lib/espaces";
import type { Vehicule } from "@/types";
import { useAuthStore, useMesVehiculesStore } from "@/stores";

type Modale =
  { type: "formulaire"; vehicule: Vehicule | null } | { type: "chauffeur"; vehicule: Vehicule };

/** Véhicules du propriétaire : il les ajoute, les décrit et les confie à ses chauffeurs. */
export default function MesVehiculesPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const vehicules = useMesVehiculesStore();
  const droits = user?.permissions?.mes_vehicules;
  const voit = peutVoir(user, "mes_vehicules");
  const [modale, setModale] = useState<Modale | null>(null);

  useEffect(() => {
    if (voit) useMesVehiculesStore.getState().fetchAll();
  }, [voit]);

  const ficheDe = (v: Vehicule) => `/proprietaire/espace/vehicules/${v.id}`;

  if (!voit) {
    return (
      <p className="alert-info">
        La gestion de vos véhicules n&apos;est pas ouverte pour votre compte. Contactez la mairie.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Mes véhicules</h1>
          <p className="mt-1 text-text-muted">
            Les véhicules enregistrés à votre nom et leur chauffeur.
          </p>
        </div>
        {droits?.creer && (
          <button
            onClick={() => setModale({ type: "formulaire", vehicule: null })}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="size-4" />
            Ajouter un véhicule
          </button>
        )}
      </div>

      <TableVehicules
        loading={vehicules.loading}
        error={vehicules.error}
        rows={vehicules.items}
        lien={ficheDe}
        lienChauffeur={(id) => `/proprietaire/espace/chauffeurs/${id}`}
        masquer={["proprietaire"]}
        actions={(v) => (
          <RowActions
            actions={[
              { label: "Voir la fiche", icon: Eye, onClick: () => router.push(ficheDe(v)) },
              {
                label: "Modifier",
                icon: Pencil,
                visible: droits?.modifier === true,
                onClick: () => setModale({ type: "formulaire", vehicule: v }),
              },
              {
                label: v.chauffeur_actuel_id ? "Changer de chauffeur" : "Attribuer un chauffeur",
                icon: UserCog,
                visible: droits?.modifier === true,
                onClick: () => setModale({ type: "chauffeur", vehicule: v }),
              },
            ]}
          />
        )}
      />

      <p className="flex items-start gap-2 text-sm text-text-muted">
        <Info className="mt-0.5 size-4 shrink-0" />
        Un véhicule ajouté apparaît « En vérification » jusqu&apos;à ce que la mairie le valide. Le
        statut et l&apos;autorisation de circuler sont décidés par la mairie.
      </p>

      {modale?.type === "formulaire" && (
        <VehiculeFormModal
          key={modale.vehicule?.id ?? "nouveau"}
          espace="proprietaire"
          vehicule={modale.vehicule}
          onClose={() => setModale(null)}
        />
      )}
      {modale?.type === "chauffeur" && (
        <AttribuerChauffeurModal
          vehicule={modale.vehicule}
          espace="proprietaire"
          onClose={() => setModale(null)}
        />
      )}
    </div>
  );
}
