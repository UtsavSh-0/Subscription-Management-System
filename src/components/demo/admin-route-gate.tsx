"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";

export function AdminRouteGate({ children }: { children: ReactNode }) {
  const { user, hydrated } = useAppStore();
  const router = useRouter();
  useEffect(() => {
    if (hydrated && (!user || user.role !== "admin")) router.replace(user ? `/${user.role}/dashboard` : "/admin/login");
  }, [hydrated, router, user]);
  if (!hydrated || user?.role !== "admin") return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading demo workspace…</div>;
  return children;
}
