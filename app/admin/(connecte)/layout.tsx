"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Toaster from "@/components/Toaster";
import { useAuthStore } from "@/stores";

/** Toutes les pages de ce groupe exigent d'être connecté. */
export default function ConnecteLayout({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);
  const sansPermissions = useAuthStore((s) => s.user !== null && s.user.permissions === undefined);
  const router = useRouter();

  useEffect(() => {
    useAuthStore.persist.rehydrate();
  }, []);

  // Session ouverte avant que l'API renvoie les permissions : on force une nouvelle connexion
  useEffect(() => {
    if (hydrated && sansPermissions) useAuthStore.getState().logout();
  }, [hydrated, sansPermissions]);

  useEffect(() => {
    if (hydrated && !token) router.replace("/admin");
  }, [hydrated, token, router]);

  // Les permissions du rôle peuvent avoir changé depuis la connexion (page Rôles)
  useEffect(() => {
    if (hydrated && token) useAuthStore.getState().rafraichir();
  }, [hydrated, token]);

  if (!hydrated || !token) return null;

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
