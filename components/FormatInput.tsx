"use client";

import { useState } from "react";
import {
  cinValide,
  formaterCin,
  formaterTelephone,
  normaliserTelephone,
  telephoneValide,
} from "@/lib/formats";

type FormatInputProps = {
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  placeholder?: string;
};

type Config = {
  formater: (v: string) => string;
  /** Valeur envoyée avec le formulaire. */
  enregistrer: (v: string) => string;
  valide: (v: string) => boolean;
  message: string;
  inputMode: "numeric" | "tel";
  maxLength: number;
};

/** Champ texte mis en forme pendant la saisie ; la valeur normalisée part dans un champ caché. */
function FormatInput({
  name,
  defaultValue,
  required,
  placeholder,
  config,
}: FormatInputProps & { config: Config }) {
  const [saisie, setSaisie] = useState(config.formater(defaultValue ?? ""));
  const erreur = saisie && !config.valide(saisie) ? config.message : "";

  return (
    <>
      <input type="hidden" name={name} value={saisie ? config.enregistrer(saisie) : ""} />
      <input
        value={saisie}
        onChange={(e) => {
          setSaisie(config.formater(e.target.value));
          e.target.setCustomValidity("");
        }}
        onBlur={(e) => e.target.setCustomValidity(erreur)}
        onInvalid={(e) => e.currentTarget.setCustomValidity(erreur || "Champ obligatoire")}
        required={required}
        inputMode={config.inputMode}
        maxLength={config.maxLength}
        placeholder={placeholder}
        aria-invalid={!!erreur}
        className={`input-field font-mono tracking-wide ${erreur ? "border-danger" : ""}`}
      />
      {erreur && <span className="mt-1 block text-xs text-danger">{erreur}</span>}
    </>
  );
}

const CIN: Config = {
  formater: formaterCin,
  enregistrer: (v) => v.replace(/\D/g, ""),
  valide: cinValide,
  message: "La CIN compte 12 chiffres.",
  inputMode: "numeric",
  maxLength: 15,
};

const TELEPHONE: Config = {
  formater: formaterTelephone,
  enregistrer: normaliserTelephone,
  valide: telephoneValide,
  message: "Numéro incomplet : 034 12 345 67 ou +261 34 12 345 67.",
  inputMode: "tel",
  maxLength: 17,
};

/** CIN malgache : 101 211 123 456. Envoyée sans espaces. */
export function CinInput(props: FormatInputProps) {
  return <FormatInput placeholder="101 211 123 456" {...props} config={CIN} />;
}

/** Téléphone malgache : 034 12 345 67. Envoyé au format +261341234567. */
export function TelephoneInput(props: FormatInputProps) {
  return <FormatInput placeholder="034 12 345 67" {...props} config={TELEPHONE} />;
}
