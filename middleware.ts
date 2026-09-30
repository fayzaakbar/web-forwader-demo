import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { areWorkspacesEnabled, isDemoForwarderPreview, isDemoRolePreview } from "@/lib/workspaces";

export async function middleware(request: NextRequest) {
  if (isDemoRolePreview()) return NextResponse.next({ request });
  if (isDemoForwarderPreview() && request.nextUrl.pathname.startsWith("/forwarder")) {
    return NextResponse.next({ request });
  }
  if (!areWorkspacesEnabled()) {
    if (["/login", "/admin/login", "/forwarder/login", "/forwarder/register"].includes(request.nextUrl.pathname)) {
      return NextResponse.next({ request });
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/forwarder/:path*", "/login"],
};
