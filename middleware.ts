import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { normalizeRole, roleToRoute } from "@/lib/auth";

const APP_ROLES = {
  "/admin": "ADMIN",
  "/mentor": "MENTOR",
  "/student": "CHILD",
  "/influencer": "INFLUENCER"
} as const;

const AUTH_ROUTES = new Set(["/login", "/register", "/forgot-password"]);

function isProtectedPath(pathname: string) {
  return Object.keys(APP_ROLES).some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;
  const demoCookie = request.cookies.get("hjb-demo-session")?.value;

  if (demoCookie) {
    try {
      const session = JSON.parse(demoCookie) as { role?: string };

      if (isProtectedPath(pathname) && pathname !== "/") {
        const requiredRole = Object.entries(APP_ROLES).find(([route]) =>
          pathname === route || pathname.startsWith(`${route}/`)
        )?.[1];

        if (requiredRole && normalizeRole(session.role) !== requiredRole) {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = roleToRoute(normalizeRole(session.role) ?? "CHILD");
          return NextResponse.redirect(redirectUrl);
        }
      }

      if (AUTH_ROUTES.has(pathname)) {
        const role = normalizeRole(session.role) ?? "CHILD";
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = roleToRoute(role);
        return NextResponse.redirect(redirectUrl);
      }
    } catch {
      // Ignore invalid demo sessions and continue to standard auth flow.
    }
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  const { data, error } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user && isProtectedPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && AUTH_ROUTES.has(pathname)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    const role = normalizeRole(profile?.role) ?? "CHILD";

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = roleToRoute(role);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isProtectedPath(pathname)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    const preferredRole = normalizeRole(profile?.role) ?? "CHILD";

    const requiredRole = Object.entries(APP_ROLES).find(([route]) =>
      pathname === route || pathname.startsWith(`${route}/`)
    )?.[1];

    if (requiredRole && preferredRole !== requiredRole) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = roleToRoute(preferredRole);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
