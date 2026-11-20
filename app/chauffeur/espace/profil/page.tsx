"use client";

import MonProfilChauffeur from "@/components/chauffeur/MonProfilChauffeur";

export default function MonProfilChauffeurPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Mon profil</h1>
        <p className="mt-1 text-text-muted">
          Vos informations auprès de la mairie. Complétez-les pour accélérer la validation.
        </p>
      </div>
      <MonProfilChauffeur />
    </div>
  );
}
