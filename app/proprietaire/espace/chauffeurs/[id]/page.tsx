import { Suspense } from "react";
import FicheMonChauffeur from "@/components/chauffeurs/FicheMonChauffeur";
import { FicheSkeleton } from "@/components/fiche/FicheElements";

/** Fiche d'un de mes chauffeurs : l'id est lu côté client, sous Suspense (cacheComponents). */
export default function FicheMonChauffeurPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<FicheSkeleton />}>
      <FicheMonChauffeur params={params} />
    </Suspense>
  );
}
