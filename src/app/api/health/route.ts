import { NextResponse } from "next/server";
import { handler } from "@/lib/errors";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** Connectivity check: confirms env vars are valid and the schema migrations were applied. No data is returned. */
export const GET = handler(async () => {
  const { error } = await createAdminClient().from("plans").select("id", { head: true, count: "exact" });
  if (error) return NextResponse.json({ ok: false, database: "unreachable_or_unmigrated" }, { status: 503 });
  return NextResponse.json({ ok: true, database: "connected" });
});
