import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { homeFor, loginFor, type Role, type SessionUser } from "@/lib/auth/portals";

/** The signed-in user with their role read from the database (never from client-writable metadata). */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data: p } = await supabase.from("profiles").select("full_name,email,role,is_demo").eq("id", auth.user.id).maybeSingle();
  if (!p) return null;
  const user: SessionUser = { id: auth.user.id, email: p.email, name: p.full_name || p.email, role: p.role, isDemo: p.is_demo, viewable: [] };
  if (p.role === "customer") {
    const { data: c } = await supabase.from("customers").select("id").eq("user_id", auth.user.id).maybeSingle();
    user.customerId = c?.id;
  } else if (p.role === "staff") {
    const { data: perms } = await supabase.from("staff_permissions").select("module").eq("profile_id", auth.user.id).eq("can_view", true);
    user.viewable = (perms ?? []).map((r) => r.module);
  }
  return user;
});

/** Server-side gate for a portal. Signed-out -> that portal's login. Wrong role -> their own dashboard. */
export async function requireRole(role: Role): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(loginFor(role));
  if (user.role !== role) redirect(homeFor(user.role));
  return user;
}

/** Page-level check: admin always; staff need view permission on the module. */
export function requireModule(user: SessionUser, module: string) {
  if (user.role === "staff" && !user.viewable.includes(module)) notFound();
}
