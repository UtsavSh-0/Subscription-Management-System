import {
  CreditCard, Home, type LucideIcon, Mail, Receipt, Repeat, User, UserCog, Users, FileText, Package, Contact, LifeBuoy, ScrollText, ArrowLeftRight,
} from "lucide-react";
import type { Role, SessionUser } from "@/lib/auth/portals";

export type { Role };
export { ROLE_LABEL } from "@/lib/auth/portals";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Staff only see the item when an admin granted view access to this module. */
  module?: string;
}
export interface NavGroup {
  label?: string;
  items: NavItem[];
}

const item = (role: Role, path: string, label: string, icon: LucideIcon, module?: string): NavItem => ({
  label, href: `/${role}/${path}`, icon, module,
});

const team = (role: "admin" | "staff"): NavGroup[] => [
  { items: [item(role, "dashboard", "Dashboard", Home)] },
  {
    label: "Sales",
    items: [
      item(role, "customers", role === "staff" ? "My customers" : "Customers", Users, "customers"),
      item(role, "quotations", "Quotations", FileText, "quotations"),
      item(role, "subscriptions", "Subscriptions", Repeat, "subscriptions"),
      item(role, "support", "Support inbox", LifeBuoy, "support"),
    ],
  },
  {
    label: "Billing",
    items: [item(role, "invoices", "Invoices", Receipt, "invoices"), item(role, "payments", "Payments", CreditCard, "payments")],
  },
];

const NAV: Record<Role, NavGroup[]> = {
  admin: [
    ...team("admin"),
    { label: "Administration", items: [item("admin", "catalog", "Products and plans", Package), item("admin", "staff", "Staff", UserCog), item("admin", "reports", "Reports & forecast", Mail), item("admin", "imports", "Import / export", ArrowLeftRight), item("admin", "audit", "Audit log", ScrollText), item("admin", "settings", "Settings & automation", User)] },
    { label: "Account", items: [item("admin", "profile", "Profile", User)] },
  ],
  staff: [...team("staff"), { label: "Account", items: [item("staff", "profile", "Profile", User)] }],
  customer: [
    { items: [item("customer", "dashboard", "Dashboard", Home)] },
    {
      label: "My account",
      items: [
        item("customer", "catalog", "Browse plans", Package),
        item("customer", "subscriptions", "My subscriptions", Repeat),
        item("customer", "quotations", "My quotations", FileText),
        item("customer", "invoices", "My invoices", Receipt),
        item("customer", "payments", "My payments", CreditCard),
        item("customer", "support", "Support center", LifeBuoy),
        item("customer", "billing", "Billing details", Contact),
        item("customer", "profile", "Profile", User),
      ],
    },
  ],
};

export function navFor(user: Pick<SessionUser, "role" | "viewable">): NavGroup[] {
  return NAV[user.role]
    .map((g) => ({ ...g, items: g.items.filter((i) => !i.module || user.role !== "staff" || user.viewable.includes(i.module)) }))
    .filter((g) => g.items.length);
}
