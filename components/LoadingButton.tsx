import type { ButtonHTMLAttributes } from "react";
import { LoaderCircle } from "lucide-react";

type LoadingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

/** Bouton désactivé avec un indicateur qui tourne pendant le chargement. */
export default function LoadingButton({
  loading,
  disabled,
  className = "",
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`inline-flex items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-70 ${className}`}
    >
      {loading && <LoaderCircle className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
