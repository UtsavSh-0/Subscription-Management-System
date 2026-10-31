"use client";
import { useEffect, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { homeFor, isRole, loginFor } from "@/lib/auth/portals";
import { useAppStore } from "@/store/app-store";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, hydrated } = useAppStore();
  const router = useRouter();
  const params = useParams<{ portal: string }>();
  const portal = params.portal;
  useEffect(() => {
    if (!hydrated) return;
    if (!isRole(portal)) router.replace("/");
    else if (!user) router.replace(loginFor(portal));
    else if (user.role !== portal) router.replace(homeFor(user.role));
  }, [hydrated, portal, router, user]);
  if (!hydrated || !user || user.role !== portal) return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading demo workspace…</div>;
  return <AppShell>{children}</AppShell>;
}
