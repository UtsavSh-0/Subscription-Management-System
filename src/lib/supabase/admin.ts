import "server-only";
import { createClient as createSupabase } from "@supabase/supabase-js";
import { publicEnv, serverEnv } from "@/lib/env";

/**
 * Service-role client: BYPASSES Row Level Security. Server code only, and only for work that has no
 * user session (billing job, creating staff accounts, audit log writes). Authorise the caller first.
 */
export function createAdminClient() {
  return createSupabase(publicEnv().NEXT_PUBLIC_SUPABASE_URL, serverEnv().SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
