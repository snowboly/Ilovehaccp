import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseService } from "@/lib/supabase";

export async function GET() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );

  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ data: roleRow }, { data: whitelistRow }] = await Promise.all([
    supabaseService.from("user_roles").select("role").eq("user_id", user.id).maybeSingle(),
    supabaseService.from("admin_whitelist").select("email").eq("email", user.email ?? "").maybeSingle(),
  ]);

  const isAdmin = roleRow?.role === "admin" && !!whitelistRow?.email;
  return NextResponse.json({ isAdmin });
}
