import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AdminRouteGate } from "@/components/demo/admin-route-gate";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AdminRouteGate><AppShell>{children}</AppShell></AdminRouteGate>;
}
