export type Role = "admin" | "staff" | "customer";
export const ROLES: Role[] = ["admin", "staff", "customer"];
export const ROLE_LABEL: Record<Role, string> = { admin: "Admin", staff: "Staff", customer: "Customer" };
export const isRole = (v: string | undefined): v is Role => !!v && (ROLES as string[]).includes(v);
export const homeFor = (r: Role) => `/${r}/dashboard`;
export const loginFor = (r: Role) => `/${r}/login`;
/** Auth pages that do not need a session (second path segment). */
export const PUBLIC_PORTAL_PAGES = ["login", "register", "forgot-password", "reset-password"];

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  isDemo: boolean;
  customerId?: string;
  /** Staff only: modules this account may view (set by an admin). */
  viewable: string[];
}
