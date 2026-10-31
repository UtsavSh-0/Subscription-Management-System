import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import type { Role } from "@/lib/auth/portals";
import { requireRole } from "@/lib/auth/session";
import { loadAppData } from "@/lib/data/load";
import { AppStoreProvider } from "@/store/app-store";

export const dynamic = "force-dynamic";

/** The gate: a valid session whose DATABASE role matches this portal, otherwise redirect. Data loads under RLS. */
export default async function ProtectedLayout({ children, params }: { children: ReactNode; params: Promise<{ portal: string }> }) {
  const user = await requireRole((await params).portal as Role);
  const data = await loadAppData();
  return (
    <AppStoreProvider user={user} data={data}>
      <AppShell>{children}</AppShell>
    </AppStoreProvider>
  );
}
