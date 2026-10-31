import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { forbidden, handler, unauthorized } from "@/lib/errors";
import { getSessionUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { publicEnv } from "@/lib/env";

const body = z.object({ name: z.string().trim().min(2).max(120), email: z.string().trim().toLowerCase().pipe(z.email()) });

/** Admin-only. Creates a staff account (role set in app_metadata, which clients cannot write) and emails a set-password link. */
export const POST = handler(async (req: Request) => {
  const caller = await getSessionUser();
  if (!caller) throw unauthorized();
  if (caller.role !== "admin") throw forbidden("Only admins can create staff accounts");
  if (caller.isDemo) throw forbidden("Demo accounts cannot invite production users");
  const { name, email } = body.parse(await req.json());

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: randomBytes(24).toString("base64url"),   // never shown to anyone; the invitee sets their own
    email_confirm: true,
    app_metadata: { role: "staff" },
    user_metadata: { full_name: name },
  });
  if (error || !data.user) {
    const taken = /already|registered|exists/i.test(error?.message ?? "");
    return NextResponse.json({ error: { code: taken ? "conflict" : "create_failed", message: taken ? "An account with this email already exists" : "Could not create the account" } }, { status: taken ? 409 : 400 });
  }
  await admin.from("audit_logs").insert({ actor_id: caller.id, action: "staff.invite", entity: "profiles", entity_id: data.user.id, metadata: { email } });

  const { error: mailError } = await admin.auth.resetPasswordForEmail(email, { redirectTo: `${publicEnv().NEXT_PUBLIC_APP_URL}/auth/callback?next=/staff/reset-password` });
  if (mailError) return NextResponse.json({ ok: true, warning: "Account created but the email could not be sent. Use Forgot password on the staff login." }, { status: 201 });
  return NextResponse.json({ ok: true }, { status: 201 });
});
