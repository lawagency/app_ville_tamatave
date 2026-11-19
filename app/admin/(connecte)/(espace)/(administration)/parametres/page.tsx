"use client";

import { useEffect } from "react";
import IdentifiantsConfig from "@/components/parametres/IdentifiantsConfig";
import ParametresForm from "@/components/parametres/ParametresForm";
import Skeleton from "@/components/Skeleton";
import { PageHeader } from "@/components/ui";
import { peutVoir } from "@/lib/espaces";
import { useAuthStore, useCommunesStore } from "@/stores";

/** Configuration de la mairie : une seule commune, pas de tableau. */
export default function ParametresPage() {
  const communes = useCommunesStore();
  const user = useAuthStore((s) => s.user);
  const voitCommune = peutVoir(user, "communes");
  const voitIdentifiants = peutVoir(user, "identifiants");

  useEffect(() => {
    useCommunesStore.getState().fetchAll();
  }, []);

  const commune = communes.items[0];

  return (
    <>
      <PageHeader
        title="Infos mairie"
        subtitle="Informations officielles de la mairie, utilisées sur les documents et le portail"
      />

      {communes.error && <p className="alert-error">{communes.error}</p>}
      {communes.loading && communes.items.length === 0 && (
        <div className="card grid gap-8 p-8 lg:grid-cols-[1fr_18rem]">
          <div className="space-y-8">
            {[0, 1, 2].map((section) => (
              <div key={section} className="space-y-4">
                <Skeleton className="h-4 w-48" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="size-44" />
            <Skeleton className="h-9 w-40" />
          </div>
        </div>
      )}

      {voitCommune && !communes.loading && !communes.error && (
        // La clé recrée le formulaire avec les bonnes valeurs une fois la commune chargée
        <ParametresForm key={commune?.id ?? "nouvelle"} commune={commune} />
      )}

      {voitIdentifiants && <IdentifiantsConfig />}
    </>
  );
}
