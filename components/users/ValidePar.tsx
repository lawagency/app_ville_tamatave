"use client";

import { useEffect, useState } from "react";
import Skeleton from "@/components/Skeleton";
import { api } from "@/lib/api";
import { useUsersStore } from "@/stores";
import type { User } from "@/types";

type Fiche = User & { valide_par: number | string | null };

const nomComplet = (u: Pick<User, "nom" | "prenom">) => `${u.prenom} ${u.nom.toUpperCase()}`;

/**
 * Nom de l'administrateur qui a validé le compte.
 * `valide_par` n'est que dans la fiche (`GET /users/:id`) : on la charge, puis on cherche
 * le validateur dans la liste déjà chargée, sinon on charge aussi sa fiche.
 */
export default function ValidePar({ userId }: { userId: number }) {
  const users = useUsersStore((s) => s.items);
  const [validateurId, setValidateurId] = useState<string | null>();
  const [nomCharge, setNomCharge] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let actif = true;
    api<Fiche>(`/users/${userId}`)
      .then((fiche) => actif && setValidateurId(fiche.valide_par ? String(fiche.valide_par) : null))
      .catch((e: Error) => actif && setError(e.message));
    return () => {
      actif = false;
    };
  }, [userId]);

  // Les id BIGINT arrivent en texte depuis PostgreSQL : on compare en texte
  const dansLaListe = validateurId ? users.find((u) => String(u.id) === validateurId) : undefined;

  useEffect(() => {
    if (!validateurId || dansLaListe) return;
    let actif = true;
    api<User>(`/users/${validateurId}`)
      .then((v) => actif && setNomCharge(nomComplet(v)))
      .catch(() => actif && setNomCharge(`Utilisateur n°${validateurId}`));
    return () => {
      actif = false;
    };
  }, [validateurId, dansLaListe]);

  if (error) return <span className="text-text-muted">—</span>;
  if (validateurId === undefined) return <Skeleton className="h-4 w-32" />;
  if (validateurId === null) return <span className="text-text-muted">—</span>;
  if (dansLaListe) return <>{nomComplet(dansLaListe)}</>;
  return <>{nomCharge ?? <Skeleton className="h-4 w-32" />}</>;
}
