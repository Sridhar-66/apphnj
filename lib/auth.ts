import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AppRole = "ADMIN" | "MENTOR" | "CHILD" | "INFLUENCER";

export type SessionUser = {
  id: string;
  email: string;
  full_name: string;
  role: AppRole;
};

export function normalizeRole(value: string | null | undefined): AppRole | null {
  if (!value) {
    return null;
  }

  switch (value.toUpperCase()) {
    case "ADMIN":
      return "ADMIN";
    case "MENTOR":
      return "MENTOR";
    case "CHILD":
    case "STUDENT":
      return "CHILD";
    case "INFLUENCER":
      return "INFLUENCER";
    default:
      return null;
  }
}

export function roleToRoute(role: AppRole) {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "MENTOR":
      return "/mentor";
    case "CHILD":
      return "/student";
    case "INFLUENCER":
      return "/influencer";
    default:
      return "/student";
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", data.user.id)
    .maybeSingle();

  const role = normalizeRole(profile?.role);

  if (!role) {
    return null;
  }

  return {
    id: data.user.id,
    email: data.user.email ?? "",
    full_name:
      typeof profile?.full_name === "string"
        ? profile.full_name
        : data.user.email ?? "User",
    role
  };
}

export async function requireRole(role: AppRole): Promise<SessionUser> {
  const session = await getSessionUser();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== role) {
    redirect(roleToRoute(session.role));
  }

  return session;
}
