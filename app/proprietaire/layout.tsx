"use client";

import { useEffect } from "react";
import Toaster from "@/components/Toaster";
import { useAuthStore } from "@/stores";

/** Plateforme propriétaire : relit la session et affiche les notifications. */
export default function ProprietaireLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useAuthStore.persist.rehydrate();
  }, []);

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-background">
      {children}
      <Toaster />
    </div>
  );
}
