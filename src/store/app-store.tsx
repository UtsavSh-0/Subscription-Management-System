"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SessionUser } from "@/lib/auth/portals";
import type { AppData } from "@/types";

interface StoreValue {
  data: AppData;
  user: SessionUser;
}

const Ctx = createContext<StoreValue | null>(null);

/** Read-only context fed by server components: the session user and the records RLS lets them see. */
export function AppStoreProvider({ user, data, children }: StoreValue & { children: ReactNode }) {
  return <Ctx.Provider value={{ user, data }}>{children}</Ctx.Provider>;
}

export function useAppStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppStore must be used inside AppStoreProvider");
  return v;
}
