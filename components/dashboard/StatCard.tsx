import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import Skeleton from "@/components/Skeleton";

type StatCardProps = {
  label: string;
  badge: string;
  icon: LucideIcon;
  iconClass: string;
  value?: number;
  detail?: string;
  loading?: boolean;
  /** Sans lien, la carte n'est pas cliquable. */
  href?: string;
};

export default function StatCard({
  label,
  badge,
  icon: Icon,
  iconClass,
  value,
  detail,
  loading,
  href,
}: StatCardProps) {
  const contenu = (
    <>
      <div className="flex items-start justify-between">
        <span className={`badge ${badge}`}>{label}</span>
        <Icon className={`size-6 ${iconClass}`} strokeWidth={1.8} />
      </div>
      {loading ? (
        <>
          <Skeleton className="mt-4 h-9 w-20" />
          <Skeleton className="mt-3 h-4 w-32" />
        </>
      ) : (
        <>
          <p className="mt-4 text-3xl font-semibold">{value ?? "—"}</p>
          <p className="mt-3 text-sm text-text-muted">{detail ?? " "}</p>
        </>
      )}
    </>
  );

  return href ? (
    <Link href={href} className="card block transition-colors hover:border-primary/40">
      {contenu}
    </Link>
  ) : (
    <div className="card">{contenu}</div>
  );
}
