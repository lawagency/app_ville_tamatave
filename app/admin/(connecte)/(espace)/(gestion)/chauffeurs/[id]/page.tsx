import { Suspense } from "react";
import FicheChauffeur from "@/components/chauffeurs/FicheChauffeur";
import { FicheSkeleton } from "@/components/fiche/FicheElements";

/** Fiche détaillée d'un chauffeur : l'id est lu côté client, sous Suspense (cacheComponents). */
export default function FicheChauffeurPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<FicheSkeleton />}>
      <FicheChauffeur params={params} />
    </Suspense>
  );
}
