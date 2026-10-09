import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Runs only for the admin panel (see matcher), never for store pages,
 * so public traffic does not spend function invocations.
 * Refreshes the Supabase session cookie and guards /admin: only users listed
 * in public.admins get past the login page. A signed-in account that is not
 * an admin stays on the login page with an explanation (no redirect loop).
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data } = await supabase.rpc("is_admin");
    isAdmin = data === true;
  }

  // Redirects keep any refreshed session cookies.
  const redirectTo = (pathname: string, search = "") => {
    const target = request.nextUrl.clone();
    target.pathname = pathname;
    target.search = search;
    const res = NextResponse.redirect(target);
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  };

  const isLogin = request.nextUrl.pathname.startsWith("/admin/login");

  if (!isAdmin && !isLogin) return redirectTo("/admin/login", user ? "?erro=sem-permissao" : "");
  if (isAdmin && isLogin) return redirectTo("/admin");

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/admin"],
};
