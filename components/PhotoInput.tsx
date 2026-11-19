"use client";

import { useEffect, useMemo, useRef } from "react";
import { Camera, Trash2, UserRound } from "lucide-react";
import { toast } from "@/stores";

const FORMATS = ["image/jpeg", "image/png", "image/webp"];

type PhotoInputProps = {
  /** URL de la photo déjà enregistrée. */
  actuelle?: string | null;
  /** Fichier choisi, envoyé après l'enregistrement de la fiche. */
  fichier: File | null;
  onChange: (fichier: File | null) => void;
};

/** Photo d'identité ronde : aperçu, choix ou glisser-déposer. */
export default function PhotoInput({ actuelle, fichier, onChange }: PhotoInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const apercu = useMemo(() => (fichier ? URL.createObjectURL(fichier) : null), [fichier]);

  // Libère l'URL temporaire quand le fichier change ou que le champ disparaît
  useEffect(() => {
    return () => {
      if (apercu) URL.revokeObjectURL(apercu);
    };
  }, [apercu]);

  function choisir(file?: File) {
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;
    if (!FORMATS.includes(file.type)) {
      toast.error("Format non pris en charge : JPEG, PNG ou WebP.");
      return;
    }
    onChange(file);
  }

  const affichee = fichier ? apercu : actuelle;

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          choisir(e.dataTransfer.files[0]);
        }}
        className="group relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-background text-text-muted transition-colors hover:border-primary"
        aria-label="Choisir une photo"
      >
        {affichee ? (
          // eslint-disable-next-line @next/next/no-img-element -- aperçu local ou image de l'API
          <img src={affichee} alt="Photo" className="size-full object-cover" />
        ) : (
          <UserRound className="size-10" strokeWidth={1.5} />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-text-main/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
          <Camera className="size-6" />
        </span>
      </button>

      <div className="space-y-2">
        <div className="flex flex-nowrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="btn-ghost inline-flex items-center gap-2 whitespace-nowrap px-3 text-sm"
          >
            <Camera className="size-4" />
            {affichee ? "Changer" : "Ajouter une photo"}
          </button>
          {fichier && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="btn-ghost inline-flex items-center px-3 text-sm text-danger"
              aria-label="Annuler la nouvelle photo"
              title="Annuler la nouvelle photo"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
        <p className="text-xs text-text-muted">Photo d&apos;identité, JPEG, PNG ou WebP.</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={FORMATS.join(",")}
        className="hidden"
        onChange={(e) => choisir(e.target.files?.[0])}
      />
    </div>
  );
}
