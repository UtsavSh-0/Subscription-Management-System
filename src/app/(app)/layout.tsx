import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth/session";
import { loadAppData } from "@/lib/data/load";
import { AppStoreProvider } from "@/store/app-store";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("admin");
  const data = await loadAppData();

  return (
    <AppStoreProvider user={user} data={data}>
      <AppShell>{children}</AppShell>
    </AppStoreProvider>
  );
}
