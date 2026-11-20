"use client";

import { useEffect, useState } from "react";
import { Car, Layers3 } from "lucide-react";
import ListeSimpleTab from "@/components/configuration/ListeSimpleTab";
import SousTypesDocumentsTab from "@/components/configuration/SousTypesDocumentsTab";
import TypesChauffeursTab from "@/components/configuration/TypesChauffeursTab";
import TypesDocumentsTab from "@/components/configuration/TypesDocumentsTab";
import { FilterTabs, PageHeader } from "@/components/ui";
import { peutVoir } from "@/lib/espaces";
import {
  useAuthStore,
  useCategoriesVehiculesStore,
  useSousTypesDocumentsStore,
  useTypesChauffeursStore,
  useTypesDocumentsStore,
  useTypesVehiculesStore,
} from "@/stores";

type Onglet =
  "types" | "sous_types" | "types_vehicules" | "categories_vehicules" | "types_chauffeurs";

/** Paramétrage de la gestion quotidienne : documents demandés, types et catégories de véhicules. */
export default function ConfigurationPage() {
  const user = useAuthStore((s) => s.user);
  const voit = {
    types: peutVoir(user, "types_documents"),
    sous_types: peutVoir(user, "types_documents_sous_types"),
    types_vehicules: peutVoir(user, "types_vehicules"),
    categories_vehicules: peutVoir(user, "categories_vehicules"),
    types_chauffeurs: peutVoir(user, "types_chauffeurs"),
  };

  const types = useTypesDocumentsStore((s) => s.items);
  const sousTypes = useSousTypesDocumentsStore((s) => s.items);
  const typesVehicules = useTypesVehiculesStore();
  const categoriesVehicules = useCategoriesVehiculesStore();
  const typesChauffeurs = useTypesChauffeursStore((s) => s.items);

  const premier = (Object.keys(voit) as Onglet[]).find((o) => voit[o]) ?? "types";
  const [onglet, setOnglet] = useState<Onglet>(premier);

  useEffect(() => {
    // Les types de documents servent aussi au formulaire et au filtre des sous-types
    if (voit.types) useTypesDocumentsStore.getState().fetchAll();
    if (voit.sous_types) useSousTypesDocumentsStore.getState().fetchAll();
    // Les types de véhicules servent aussi au formulaire des types de chauffeurs
    if (voit.types_vehicules || voit.types_chauffeurs) useTypesVehiculesStore.getState().fetchAll();
    if (voit.categories_vehicules) useCategoriesVehiculesStore.getState().fetchAll();
    if (voit.types_chauffeurs) useTypesChauffeursStore.getState().fetchAll();
  }, [
    voit.types,
    voit.sous_types,
    voit.types_vehicules,
    voit.categories_vehicules,
    voit.types_chauffeurs,
  ]);

  const tous = [
    { key: "types" as const, label: "Types de documents", count: types.length },
    { key: "sous_types" as const, label: "Sous-types", count: sousTypes.length },
    {
      key: "types_vehicules" as const,
      label: "Types de véhicules",
      count: typesVehicules.items.length,
    },
    {
      key: "categories_vehicules" as const,
      label: "Catégories de véhicules",
      count: categoriesVehicules.items.length,
    },
    {
      key: "types_chauffeurs" as const,
      label: "Types de chauffeurs",
      count: typesChauffeurs.length,
    },
  ];

  const onglets = (
    <FilterTabs
      value={onglet}
      onChange={setOnglet}
      tabs={tous.filter((t) => voit[t.key]).map((t) => ({ ...t, tone: "primary" as const }))}
    />
  );

  return (
    <>
      <PageHeader
        title="Configuration"
        subtitle="Documents demandés, véhicules et types de chauffeurs"
      />

      {onglet === "types" && <TypesDocumentsTab sousTypes={sousTypes} onglets={onglets} />}
      {onglet === "sous_types" && <SousTypesDocumentsTab types={types} onglets={onglets} />}
      {onglet === "types_vehicules" && (
        <ListeSimpleTab
          store={typesVehicules}
          icon={Car}
          onglets={onglets}
          libelles={{
            nom: "type de véhicule",
            nouveau: "Nouveau type de véhicule",
            exemple: "Voiture, moto, tricycle…",
            suppression: "Les véhicules de ce type resteront enregistrés, sans type.",
          }}
        />
      )}
      {onglet === "categories_vehicules" && (
        <ListeSimpleTab
          store={categoriesVehicules}
          icon={Layers3}
          onglets={onglets}
          libelles={{
            nom: "catégorie de véhicule",
            nouveau: "Nouvelle catégorie de véhicule",
            exemple: "Taxi-ville, taxi-be, transport de marchandises…",
            suppression: "Les véhicules de cette catégorie resteront enregistrés, sans catégorie.",
            feminin: true,
          }}
        />
      )}
      {onglet === "types_chauffeurs" && (
        <TypesChauffeursTab typesVehicules={typesVehicules.items} onglets={onglets} />
      )}
    </>
  );
}
