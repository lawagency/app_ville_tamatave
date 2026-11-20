import { Suspense } from "react";
import { FicheSkeleton } from "@/components/fiche/FicheElements";
import FicheVehicule from "@/components/vehicules/FicheVehicule";

/** Fiche détaillée d'un véhicule : l'id est lu côté client, sous Suspense (cacheComponents). */
export default function FicheVehiculePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<FicheSkeleton />}>
      <FicheVehicule params={params} />
    </Suspense>
  );
}
