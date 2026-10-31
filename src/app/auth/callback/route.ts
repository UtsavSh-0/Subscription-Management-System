import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { homeFor } from "@/lib/auth/portals";

/** Email confirmation / password-recovery landing. Exchanges the code for a session, then routes by DB role. */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const supabase = await createClient();
  if (!code || (await supabase.auth.exchangeCodeForSession(code)).error) {
    return NextResponse.redirect(`${origin}/customer/login?error=link_expired`);
  }
  // Only same-site relative paths are honoured (no open redirect).
  if (next && next.startsWith("/") && !next.startsWith("//")) return NextResponse.redirect(`${origin}${next}`);
  const { data: auth } = await supabase.auth.getUser();
  const { data: p } = await supabase.from("profiles").select("role").eq("id", auth.user?.id ?? "").maybeSingle();
  return NextResponse.redirect(`${origin}${p ? homeFor(p.role) : "/"}`);
}
