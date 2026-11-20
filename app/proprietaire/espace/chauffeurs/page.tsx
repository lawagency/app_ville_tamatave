"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Info, Pencil, Plus, UserMinus } from "lucide-react";
import ChauffeurFormModal from "@/components/chauffeurs/ChauffeurFormModal";
import { nomChauffeur } from "@/components/chauffeurs/ChauffeurStatutModals";
import SituationChauffeur from "@/components/chauffeurs/SituationChauffeur";
import { ConfirmDialog } from "@/components/Modal";
import { CellTitle, DataTable, RowActions, StatusDot } from "@/components/ui";
import { fichierUrl } from "@/lib/api";
import { peutVoir } from "@/lib/espaces";
import { afficherTelephone } from "@/lib/formats";
import { useAction } from "@/lib/useAction";
import { STATUTS_CHAUFFEUR, type Chauffeur } from "@/types";
import { useAuthStore, useMesChauffeursStore } from "@/stores";

/** Chauffeurs du propriétaire : il les ajoute, les modifie et gère leur situation de travail. */
export default function MesChauffeursPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const chauffeurs = useMesChauffeursStore();
  const droits = user?.permissions?.mes_chauffeurs;
  const voit = peutVoir(user, "mes_chauffeurs");
  const [formulaire, setFormulaire] = useState<{ chauffeur: Chauffeur | null } | null>(null);
  const [retrait, setRetrait] = useState<Chauffeur | null>(null);
  const action = useAction();

  useEffect(() => {
    if (voit) useMesChauffeursStore.getState().fetchAll();
  }, [voit]);

  const ficheDe = (c: Chauffeur) => `/proprietaire/espace/chauffeurs/${c.id}`;

  async function onRetrait() {
    if (!retrait) return;
    const ok = await action.run(
      () => chauffeurs.remove(retrait.id),
      `${nomChauffeur(retrait)} retiré de vos chauffeurs`,
    );
    if (ok) setRetrait(null);
  }

  if (!voit) {
    return (
      <p className="alert-info">
        La gestion de vos chauffeurs n&apos;est pas ouverte pour votre compte. Contactez la mairie.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Mes chauffeurs</h1>
          <p className="mt-1 text-text-muted">
            Les chauffeurs que vous employez. Chaque fiche est vérifiée par la mairie.
          </p>
        </div>
        {droits?.creer && (
          <button
            onClick={() => setFormulaire({ chauffeur: null })}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="size-4" />
            Ajouter un chauffeur
          </button>
        )}
      </div>

      <DataTable
        loading={chauffeurs.loading}
        error={chauffeurs.error}
        rows={chauffeurs.items}
        onRowClick={(c) => router.push(ficheDe(c))}
        columns={[
          {
            label: "Chauffeur",
            render: (c) => (
              <Link
                href={ficheDe(c)}
                onClick={(e) => e.stopPropagation()}
                className="block hover:[&_p:first-child]:text-primary"
              >
                <CellTitle
                  title={nomChauffeur(c)}
                  subtitle={<code>{c.identifiant}</code>}
                  photo={fichierUrl(c.photo_chemin)}
                />
              </Link>
            ),
          },
          {
            label: "Type",
            render: (c) =>
              c.type_chauffeur_nom ? (
                <div>
                  <p className="font-medium">{c.type_chauffeur_nom}</p>
                  <p className="text-xs text-text-muted">{c.type_vehicule_nom}</p>
                </div>
              ) : (
                "—"
              ),
          },
          { label: "Téléphone", render: (c) => afficherTelephone(c.telephone) || "—" },
          {
            // Décidé par la mairie : lecture seule
            label: "Fiche",
            render: (c) => {
              const { label, tone } = STATUTS_CHAUFFEUR[c.statut];
              return <StatusDot tone={tone} label={label} />;
            },
          },
          {
            label: "Situation",
            render: (c) => (
              <SituationChauffeur chauffeur={c} modifiable={droits?.modifier === true} />
            ),
          },
          {
            label: "Actions",
            align: "right",
            render: (c) => (
              <RowActions
                actions={[
                  { label: "Voir la fiche", icon: Eye, onClick: () => router.push(ficheDe(c)) },
                  {
                    label: "Modifier",
                    icon: Pencil,
                    visible: droits?.modifier === true,
                    onClick: () => setFormulaire({ chauffeur: c }),
                  },
                  {
                    label: "Retirer de mes chauffeurs",
                    icon: UserMinus,
                    variant: "danger",
                    visible: droits?.supprimer === true,
                    onClick: () => setRetrait(c),
                  },
                ]}
              />
            ),
          },
        ]}
      />

      <p className="flex items-start gap-2 text-sm text-text-muted">
        <Info className="mt-0.5 size-4 shrink-0" />
        Un chauffeur ajouté apparaît « En vérification » jusqu&apos;à ce que la mairie valide sa
        fiche. Vous gérez sa situation : actif, inactif ou suspendu.
      </p>

      {formulaire && (
        <ChauffeurFormModal
          key={formulaire.chauffeur?.id ?? "nouveau"}
          espace="proprietaire"
          chauffeur={formulaire.chauffeur}
          onClose={() => setFormulaire(null)}
        />
      )}

      <ConfirmDialog
        open={retrait !== null}
        title="Retirer le chauffeur"
        message={
          <>
            Retirer <strong>{retrait && nomChauffeur(retrait)}</strong> de vos chauffeurs ? Sa fiche
            reste enregistrée à la mairie.
          </>
        }
        onConfirm={onRetrait}
        onClose={() => setRetrait(null)}
      />
    </div>
  );
}
