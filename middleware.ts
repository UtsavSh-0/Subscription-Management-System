import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isRole, PUBLIC_PORTAL_PAGES } from "@/lib/auth/portals";

/** Refreshes the Supabase session cookie and blocks signed-out access to portal pages.
 *  Role checks happen in the portal layout (database role) and again in RLS. */
export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return res;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const { data } = await supabase.auth.getUser();

  const [portal, page] = req.nextUrl.pathname.split("/").filter(Boolean);
  if (isRole(portal) && page && !PUBLIC_PORTAL_PAGES.includes(page) && !data.user) {
    const to = req.nextUrl.clone();
    to.pathname = `/${portal}/login`;
    to.search = "";
    return NextResponse.redirect(to);
  }
  return res;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico)$).*)"] };
