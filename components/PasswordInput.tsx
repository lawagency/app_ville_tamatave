"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

/** Champ mot de passe avec bouton pour afficher / masquer la saisie. */
export default function PasswordInput({ className = "", ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input {...props} type={visible ? "text" : "password"} className={`${className} pr-11`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-text-muted hover:text-primary"
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        title={visible ? "Masquer" : "Afficher"}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
