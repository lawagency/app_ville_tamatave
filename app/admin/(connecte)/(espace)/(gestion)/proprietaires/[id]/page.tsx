import { Suspense } from "react";
import FicheProprietaire, { FicheSkeleton } from "@/components/proprietaires/FicheProprietaire";

/** Fiche détaillée d'un propriétaire : l'id est lu côté client, sous Suspense (cacheComponents). */
export default function FicheProprietairePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<FicheSkeleton />}>
      <FicheProprietaire params={params} />
    </Suspense>
  );
}
