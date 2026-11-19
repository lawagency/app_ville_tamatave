"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";

const MOIS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];
const JOURS = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];
const LARGEUR = 304;
const HAUTEUR = 380;

type Vue = "jours" | "mois" | "annees";
type Position = { left: number } & ({ top: number } | { bottom: number });

/** « 2027-09-12 » à partir d'une date locale, sans décalage de fuseau. */
const versCle = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function depuisCle(cle?: string | null) {
  const m = cle?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

type DatePickerProps = {
  /** Nom du champ, lu par `FormData` à l'envoi du formulaire. */
  name?: string;
  defaultValue?: string | null;
  onChange?: (valeur: string) => void;
  placeholder?: string;
  required?: boolean;
  /** Bornes au format « AAAA-MM-JJ ». */
  min?: string;
  max?: string;
};

/** Champ de date avec calendrier aux couleurs du thème. Valeur au format « AAAA-MM-JJ ». */
export default function DatePicker({
  name,
  defaultValue,
  onChange,
  placeholder = "Choisir une date",
  required,
  min,
  max,
}: DatePickerProps) {
  const [valeur, setValeur] = useState(defaultValue?.slice(0, 10) ?? "");
  const [position, setPosition] = useState<Position | null>(null);
  const [vue, setVue] = useState<Vue>("jours");
  // Lus à l'ouverture seulement : la date du jour ne doit pas entrer dans le rendu prégénéré
  const [affiche, setAffiche] = useState(() => depuisCle(defaultValue) ?? new Date(2000, 0, 1));
  const [aujourdhui, setAujourdhui] = useState("");
  const boutonRef = useRef<HTMLButtonElement>(null);
  const caseRef = useRef<HTMLInputElement>(null);

  const selection = depuisCle(valeur);
  const annee = affiche.getFullYear();
  const mois = affiche.getMonth();

  // Garde la validation native « required » sur un champ invisible
  useLayoutEffect(() => {
    caseRef.current?.setCustomValidity(required && !valeur ? "Veuillez choisir une date." : "");
  }, [required, valeur]);

  useEffect(() => {
    if (!position) return;
    const fermer = () => setPosition(null);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && fermer();
    window.addEventListener("resize", fermer);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", fermer);
      document.removeEventListener("keydown", onKey);
    };
  }, [position]);

  function ouvrir() {
    if (position) return setPosition(null);
    const rect = boutonRef.current!.getBoundingClientRect();
    const left = Math.min(rect.left, window.innerWidth - LARGEUR - 8);
    const maintenant = new Date();
    setAujourdhui(versCle(maintenant));
    setAffiche(selection ?? maintenant);
    setVue("jours");
    setPosition(
      rect.bottom + HAUTEUR > window.innerHeight
        ? { left, bottom: window.innerHeight - rect.top + 6 }
        : { left, top: rect.bottom + 6 },
    );
  }

  function choisir(cle: string) {
    setValeur(cle);
    onChange?.(cle);
    setPosition(null);
  }

  const horsBornes = (cle: string) => (!!min && cle < min) || (!!max && cle > max);

  // 6 semaines complètes, en commençant le lundi
  const premier = new Date(annee, mois, 1);
  const decalage = (premier.getDay() + 6) % 7;
  const jours = Array.from({ length: 42 }, (_, i) => new Date(annee, mois, i - decalage + 1));

  const debutDecennie = Math.floor(annee / 12) * 12;

  function precedent() {
    if (vue === "jours") setAffiche(new Date(annee, mois - 1, 1));
    else if (vue === "mois") setAffiche(new Date(annee - 1, mois, 1));
    else setAffiche(new Date(annee - 12, mois, 1));
  }

  function suivant() {
    if (vue === "jours") setAffiche(new Date(annee, mois + 1, 1));
    else if (vue === "mois") setAffiche(new Date(annee + 1, mois, 1));
    else setAffiche(new Date(annee + 12, mois, 1));
  }

  const titre =
    vue === "jours"
      ? `${MOIS[mois]} ${annee}`
      : vue === "mois"
        ? String(annee)
        : `${debutDecennie} – ${debutDecennie + 11}`;

  const cellule = (actif: boolean) =>
    `rounded-md text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
      actif ? "bg-primary font-semibold text-white" : "hover:bg-primary/10 hover:text-primary"
    }`;

  return (
    <div className="relative">
      <input type="hidden" name={name} value={valeur} />
      <input
        ref={caseRef}
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0"
        onFocus={() => boutonRef.current?.focus()}
      />

      <button
        ref={boutonRef}
        type="button"
        onClick={ouvrir}
        aria-haspopup="dialog"
        aria-expanded={position !== null}
        className={`input-field flex items-center gap-2 text-left ${position ? "ring-2 ring-primary" : ""}`}
      >
        <CalendarDays className="size-4 shrink-0 text-text-muted" />
        <span className={`flex-1 ${selection ? "" : "text-text-muted"}`}>
          {selection
            ? selection.toLocaleDateString("fr-FR", {
                weekday: "short",
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : placeholder}
        </span>
        {selection && !required && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Effacer la date"
            onClick={(e) => {
              e.stopPropagation();
              choisir("");
            }}
            className="rounded-sm p-0.5 text-text-muted hover:bg-background hover:text-danger"
          >
            <X className="size-4" />
          </span>
        )}
      </button>

      {position &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[70]" onClick={() => setPosition(null)} />
            <div
              role="dialog"
              aria-label="Calendrier"
              style={{ ...position, width: LARGEUR }}
              className="fixed z-[71] rounded-lg border border-border bg-surface p-4 shadow-xl"
            >
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={precedent}
                  className="icon-btn"
                  aria-label="Précédent"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setVue(vue === "jours" ? "mois" : "annees")}
                  disabled={vue === "annees"}
                  className="rounded-md px-3 py-1.5 text-sm font-bold text-primary transition-colors hover:bg-primary/10 disabled:hover:bg-transparent"
                >
                  {titre}
                </button>
                <button type="button" onClick={suivant} className="icon-btn" aria-label="Suivant">
                  <ChevronRight className="size-4" />
                </button>
              </div>

              {vue === "jours" && (
                <>
                  <div className="mb-1 grid grid-cols-7 text-center text-xs font-semibold text-text-muted">
                    {JOURS.map((j) => (
                      <span key={j} className="py-1">
                        {j}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {jours.map((d) => {
                      const cle = versCle(d);
                      const actif = cle === valeur;
                      const autreMois = d.getMonth() !== mois;
                      return (
                        <button
                          key={cle}
                          type="button"
                          disabled={horsBornes(cle)}
                          onClick={() => choisir(cle)}
                          className={`size-9 ${cellule(actif)} ${
                            !actif && autreMois ? "text-text-muted/50" : ""
                          } ${!actif && cle === aujourdhui ? "font-bold text-primary ring-1 ring-primary/40" : ""}`}
                        >
                          {d.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {vue === "mois" && (
                <div className="grid grid-cols-3 gap-2">
                  {MOIS.map((m, i) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setAffiche(new Date(annee, i, 1));
                        setVue("jours");
                      }}
                      className={`py-3 ${cellule(selection?.getFullYear() === annee && selection.getMonth() === i)}`}
                    >
                      {m.slice(0, 4)}
                      {m.length > 4 ? "." : ""}
                    </button>
                  ))}
                </div>
              )}

              {vue === "annees" && (
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 12 }, (_, i) => debutDecennie + i).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => {
                        setAffiche(new Date(a, mois, 1));
                        setVue("mois");
                      }}
                      className={`py-3 ${cellule(selection?.getFullYear() === a)}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => choisir("")}
                  className="rounded-md px-2 py-1 text-sm font-medium text-text-muted hover:bg-background hover:text-danger"
                >
                  Effacer
                </button>
                <button
                  type="button"
                  disabled={horsBornes(aujourdhui)}
                  onClick={() => choisir(aujourdhui)}
                  className="rounded-md px-2 py-1 text-sm font-semibold text-primary hover:bg-primary/10 disabled:opacity-40"
                >
                  Aujourd&apos;hui
                </button>
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
