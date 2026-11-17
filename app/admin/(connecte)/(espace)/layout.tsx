"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import NotificationsPanel from "@/components/layout/NotificationsPanel";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { espaceDuChemin, useEspaces } from "@/lib/espaces";
import { useUiStore } from "@/stores";

export default function EspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const espaces = useEspaces();
  const espaceId = espaceDuChemin(espaces, pathname)?.id;
  const autorise = espaceId !== undefined;

  useEffect(() => {
    if (!autorise) router.replace("/admin/espaces");
  }, [autorise, router]);

  useEffect(() => {
    if (espaceId) useUiStore.getState().setDernierEspace(espaceId);
  }, [espaceId]);

  if (!autorise) return null;

  return (
    <div className="flex min-h-screen flex-1">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
      <NotificationsPanel />
    </div>
  );
}
