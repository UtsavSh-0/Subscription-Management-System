"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { SessionUser } from "@/lib/auth/portals";
import type { AppData } from "@/types";
import { seedData } from "@/data/seed";

const DATA_KEY = "brightloop.demo.data.v1";
const USER_KEY = "brightloop.demo.user.v1";
const ACCOUNTS_KEY = "brightloop.demo.accounts.v1";
const DEMO_USERS: Record<string, SessionUser> = {
  "admin@brightloop.demo": { id: "demo-admin", email: "admin@brightloop.demo", name: "Brightloop Admin", role: "admin", isDemo: true, viewable: ["customers", "quotations", "subscriptions", "invoices", "payments"] },
  "staff@brightloop.demo": { id: "demo-staff", email: "staff@brightloop.demo", name: "Avery Morgan", role: "staff", isDemo: true, viewable: ["customers", "quotations", "subscriptions", "invoices", "payments"] },
  "customer@brightloop.demo": { id: "cus-1", email: "customer@brightloop.demo", name: "Meera Kapoor", role: "customer", isDemo: true, customerId: "cus-1", viewable: [] },
};
const DEMO_PASSWORDS: Record<string, string> = { "admin@brightloop.demo": "AdminDemo@123", "staff@brightloop.demo": "StaffDemo@123", "customer@brightloop.demo": "CustomerDemo@123" };
type LocalAccount = { id: string; name: string; email: string; password: string; role: SessionUser["role"]; customerId?: string };
type StoreValue = { data: AppData; user: SessionUser | null; hydrated: boolean; accounts: LocalAccount[]; setData: (data: AppData) => void; login: (email: string, password: string, portal: SessionUser["role"]) => string | null; addAccount: (account: Omit<LocalAccount, "id">) => void; logout: () => void; reset: () => void };
const Ctx = createContext<StoreValue | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<AppData>(seedData);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [accounts, setAccounts] = useState<LocalAccount[]>([]);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DATA_KEY);
      setDataState(saved ? JSON.parse(saved) as AppData : seedData);
      const savedAccounts = localStorage.getItem(ACCOUNTS_KEY);
      const accountList = savedAccounts ? JSON.parse(savedAccounts) as LocalAccount[] : [];
      setAccounts(accountList);
      const session = localStorage.getItem(USER_KEY);
      const email = session ? JSON.parse(session).email : "";
      const fixedUser = DEMO_USERS[email];
      const localUser = accountList.find(account => account.email.toLowerCase() === email.toLowerCase());
      setUser(fixedUser ?? (localUser ? { id: localUser.id, email: localUser.email, name: localUser.name, role: localUser.role, isDemo: true, customerId: localUser.customerId, viewable: localUser.role === "staff" ? ["customers", "quotations", "subscriptions", "invoices", "payments"] : [] } : null));
    } catch { setDataState(seedData); setUser(null); }
    setHydrated(true);
  }, []);
  const setData = (next: AppData) => { setDataState(next); try { localStorage.setItem(DATA_KEY, JSON.stringify(next)); } catch {} };
  const login = (email: string, password: string, portal: SessionUser["role"]) => {
    const key = email.trim().toLowerCase(); const next = DEMO_USERS[key];
    const extra = accounts.find(account => account.email.toLowerCase() === key && account.password === password);
    const candidate = next && DEMO_PASSWORDS[key] === password ? next : extra ? { id: extra.id, email: extra.email, name: extra.name, role: extra.role, isDemo: true, customerId: extra.customerId, viewable: extra.role === "staff" ? ["customers", "quotations", "subscriptions", "invoices", "payments"] : [] } : null;
    if (!candidate) return "Invalid email or password.";
    if (candidate.role !== portal) return `This account belongs to the ${candidate.role} portal.`;
    setUser(candidate); localStorage.setItem(USER_KEY, JSON.stringify({ email: key })); return null;
  };
  const addAccount = (account: Omit<LocalAccount, "id">) => { const next = [...accounts, { ...account, id: `account-${Date.now()}` }]; setAccounts(next); localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(next)); };
  const logout = () => { setUser(null); localStorage.removeItem(USER_KEY); };
  const reset = () => { setData(seedData); logout(); setAccounts([]); localStorage.removeItem(ACCOUNTS_KEY); localStorage.removeItem("brightloop.demo.contact.v1"); };
  const value = { data, user, hydrated, accounts, setData, login, addAccount, logout, reset };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppStore() {
  const value = useContext(Ctx);
  if (!value) throw new Error("useAppStore must be used inside AppStoreProvider");
  return value;
}
