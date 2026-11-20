"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn } from "lucide-react";

type Props = {
  /** URL de la photo ; sans photo, l'aperçu s'affiche sans clic possible. */
  src: string | null;
  alt: string;
  /** Miniature affichée dans la page (avatar…). */
  children: ReactNode;
};

/** Miniature cliquable qui ouvre la photo en grand, par-dessus la page. */
export default function PhotoAgrandie({ src, alt, children }: Props) {
  const [ouverte, setOuverte] = useState(false);

  useEffect(() => {
    if (!ouverte) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOuverte(false);
    const avant = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = avant;
      document.removeEventListener("keydown", onKey);
    };
  }, [ouverte]);

  if (!src) return <>{children}</>;

  return (
    <>
      <button
        type="button"
        onClick={() => setOuverte(true)}
        title="Agrandir la photo"
        aria-label={`Agrandir la photo de ${alt}`}
        className="group relative shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {children}
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
          <ZoomIn className="size-5" />
        </span>
      </button>

      {ouverte &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            onClick={() => setOuverte(false)}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-6"
          >
            <button
              type="button"
              onClick={() => setOuverte(false)}
              aria-label="Fermer"
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
              <X className="size-6" />
            </button>
            <figure
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-full flex-col items-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- image servie par l'API */}
              <img
                src={src}
                alt={alt}
                className="max-h-[80vh] max-w-[90vw] rounded-md object-contain shadow-2xl"
              />
              <figcaption className="mt-3 text-sm font-semibold text-white">{alt}</figcaption>
            </figure>
          </div>,
          document.body,
        )}
    </>
  );
}
