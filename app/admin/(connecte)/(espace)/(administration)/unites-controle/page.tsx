"use client";

import { useEffect, useState } from "react";
import CategoriesTab from "@/components/unites/CategoriesTab";
import UnitesTab from "@/components/unites/UnitesTab";
import { FilterTabs, PageHeader } from "@/components/ui";
import { peutVoir } from "@/lib/espaces";
import { useAuthStore, useCategoriesServicesStore, useUnitesControleStore } from "@/stores";

type Onglet = "unites" | "categories";

/** Unités de contrôle et leurs catégories de services, dans une seule page. */
export default function UnitesControlePage() {
  const user = useAuthStore((s) => s.user);
  const voitUnites = peutVoir(user, "unites");
  const voitCategories = peutVoir(user, "categories");

  const unites = useUnitesControleStore((s) => s.items);
  const categories = useCategoriesServicesStore((s) => s.items);
  const [onglet, setOnglet] = useState<Onglet>(voitUnites ? "unites" : "categories");

  useEffect(() => {
    if (voitUnites) useUnitesControleStore.getState().fetchAll();
    // Les catégories servent aussi au formulaire des unités
    if (voitCategories) useCategoriesServicesStore.getState().fetchAll();
  }, [voitUnites, voitCategories]);

  const onglets = (
    <FilterTabs
      value={onglet}
      onChange={setOnglet}
      tabs={[
        ...(voitUnites
          ? [
              {
                key: "unites" as const,
                label: "Unités",
                tone: "primary" as const,
                count: unites.length,
              },
            ]
          : []),
        ...(voitCategories
          ? [
              {
                key: "categories" as const,
                label: "Catégories de services",
                tone: "primary" as const,
                count: categories.length,
              },
            ]
          : []),
      ]}
    />
  );

  return (
    <>
      <PageHeader
        title="Unités de contrôle"
        subtitle="Services autorisés à contrôler sur le terrain et leur code d'accès au portail"
      />

      {onglet === "unites" ? (
        <UnitesTab categories={categories} onglets={onglets} />
      ) : (
        <CategoriesTab unites={unites} onglets={onglets} />
      )}
    </>
  );
}
