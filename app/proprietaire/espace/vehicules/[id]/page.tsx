import { Suspense } from "react";
import { FicheSkeleton } from "@/components/fiche/FicheElements";
import FicheVehicule from "@/components/vehicules/FicheVehicule";

/** Fiche d'un de mes véhicules : l'id est lu côté client, sous Suspense (cacheComponents). */
export default function FicheMonVehiculePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<FicheSkeleton />}>
      <FicheVehicule params={params} espace="proprietaire" />
    </Suspense>
  );
}
