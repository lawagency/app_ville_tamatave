"use client";

import { useEffect, useRef, useState } from "react";
import { ImageUp, Landmark, Trash2, Undo2 } from "lucide-react";
import { toast } from "@/stores";

export const FORMATS_LOGO = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

type LogoUploadProps = {
  /** URL du logo déjà enregistré sur le serveur. */
  actuel: string | null;
  /** Fichier choisi, envoyé à l'enregistrement sous la clé `logo`. */
  fichier: File | null;
  onFichierChange: (fichier: File | null) => void;
  retire: boolean;
  onRetireChange: (retire: boolean) => void;
};

/** Choix du logo : aperçu, sélection ou glisser-déposer, retrait. */
export default function LogoUpload({
  actuel,
  fichier,
  onFichierChange,
  retire,
  onRetireChange,
}: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [apercu, setApercu] = useState<string | null>(null);
  const [survol, setSurvol] = useState(false);

  // Libère l'URL temporaire de l'aperçu quand elle n'est plus utilisée
  useEffect(() => {
    return () => {
      if (apercu) URL.revokeObjectURL(apercu);
    };
  }, [apercu]);

  function choisir(file?: File) {
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;
    if (!FORMATS_LOGO.includes(file.type)) {
      toast.error("Format non pris en charge : utilisez une image PNG, JPEG, WebP ou SVG.");
      return;
    }
    setApercu(URL.createObjectURL(file));
    onFichierChange(file);
    onRetireChange(false);
  }

  function retirer() {
    setApercu(null);
    onFichierChange(null);
    onRetireChange(true);
  }

  function annulerRetrait() {
    onRetireChange(false);
  }

  const affiche = fichier && apercu ? apercu : retire ? null : actuel;

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setSurvol(true);
        }}
        onDragLeave={() => setSurvol(false)}
        onDrop={(e) => {
          e.preventDefault();
          setSurvol(false);
          choisir(e.dataTransfer.files[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex size-44 cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 border-dashed bg-background transition-colors ${
          survol ? "border-primary bg-primary/5" : "border-border hover:border-primary"
        }`}
      >
        {affiche ? (
          // eslint-disable-next-line @next/next/no-img-element -- image servie par l'API ou aperçu local
          <img src={affiche} alt="Logo de la mairie" className="size-full object-contain p-3" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-text-muted">
            <Landmark className="size-10" strokeWidth={1.5} />
            <span className="text-xs">Aucun logo</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={FORMATS_LOGO.join(",")}
        className="hidden"
        onChange={(e) => choisir(e.target.files?.[0])}
      />

      <div className="flex flex-nowrap justify-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="btn-ghost inline-flex items-center gap-2 whitespace-nowrap px-3 text-sm"
        >
          <ImageUp className="size-4" />
          {affiche ? "Changer" : "Choisir une image"}
        </button>
        {affiche && (
          <button
            type="button"
            onClick={retirer}
            className="btn-ghost inline-flex items-center gap-2 whitespace-nowrap px-3 text-sm text-danger"
          >
            <Trash2 className="size-4" />
            Retirer
          </button>
        )}
        {retire && actuel && (
          <button
            type="button"
            onClick={annulerRetrait}
            className="btn-ghost inline-flex items-center gap-2 whitespace-nowrap px-3 text-sm"
          >
            <Undo2 className="size-4" />
            Annuler
          </button>
        )}
      </div>

      <p className="text-xs text-text-muted">
        {fichier ? (
          <>
            <span className="font-medium text-text-main">{fichier.name}</span>
            <br />
            sera envoyé à l&apos;enregistrement.
          </>
        ) : (
          <>
            PNG, JPEG, WebP ou SVG.
            <br />
            Glissez l&apos;image ici ou cliquez sur le cadre.
          </>
        )}
      </p>
    </div>
  );
}
