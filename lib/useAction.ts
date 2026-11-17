"use client";

import { useState } from "react";
import { toast } from "@/stores";

/**
 * Exécute une action asynchrone : suit le chargement et affiche une notification
 * de succès ou d'erreur. `run` renvoie `true` si l'action a réussi.
 */
export function useAction() {
  const [pending, setPending] = useState(false);

  async function run(action: () => Promise<unknown>, messageSucces?: string) {
    setPending(true);
    try {
      await action();
      if (messageSucces) toast.success(messageSucces);
      return true;
    } catch (e) {
      toast.error((e as Error).message);
      return false;
    } finally {
      setPending(false);
    }
  }

  return { run, pending };
}
