"use client";

import MonProfil from "@/components/proprietaire/MonProfil";

export default function MonProfilPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Mon profil</h1>
        <p className="mt-1 text-text-muted">
          Vos informations auprès de la mairie. Complétez-les pour accélérer la validation.
        </p>
      </div>
      <MonProfil />
    </div>
  );
}
