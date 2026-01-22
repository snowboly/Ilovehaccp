import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

type NextResponseType = ReturnType<typeof NextResponse.next>;
type CookieOptions = Parameters<NextResponseType["cookies"]["set"]>[2];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute) {
    const [{ data: roleRow, error: roleError }, { data: whitelistRow, error: whitelistError }] =
      await Promise.all([
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("admin_whitelist")
          .select("email")
          .eq("email", user.email ?? "")
          .maybeSingle(),
      ]);

    const isAdmin = !roleError && roleRow?.role === "admin";
    const isWhitelisted = !whitelistError && !!whitelistRow?.email;

    if (!isAdmin || !isWhitelisted) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
