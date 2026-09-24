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

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (isProtectedPath(pathname)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("error", "configuration");
      return NextResponse.redirect(redirectUrl);
    }

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

  let user = null;

  try {
    const { data, error } = await supabase.auth.getUser();
    user = error ? null : data?.user ?? null;
  } catch {
    user = null;
  }

  if (!user && isProtectedPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && AUTH_ROUTES.has(pathname)) {
    let role: ReturnType<typeof normalizeRole> = null;

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!profileError && profile) {
        role = normalizeRole(profile.role);
      }
    } catch {
      role = null;
    }

    if (!role) {
      await supabase.auth.signOut().catch(() => undefined);
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.search = "error=profile";
      return NextResponse.redirect(redirectUrl);
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = roleToRoute(role);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isProtectedPath(pathname)) {
    let preferredRole: ReturnType<typeof normalizeRole> = null;

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!profileError && profile) {
        preferredRole = normalizeRole(profile.role);
      }
    } catch {
      preferredRole = null;
    }

    if (!preferredRole) {
      await supabase.auth.signOut().catch(() => undefined);
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.search = "error=profile";
      return NextResponse.redirect(redirectUrl);
    }

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
