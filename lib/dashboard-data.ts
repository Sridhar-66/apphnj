import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/auth";

export type RecentProfile = {
  id: string;
  full_name: string | null;
  email: string;
  role: AppRole;
  created_at: string;
};

async function countProfiles(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, role?: AppRole) {
  let query = supabase.from("profiles").select("id", { count: "exact", head: true });

  if (role) {
    query = query.eq("role", role);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(`Unable to load profile count: ${error.message}`);
  }

  return count ?? 0;
}

export async function getAdminDashboardData() {
  const supabase = await createServerSupabaseClient();
  const [students, mentors, influencers] = await Promise.all([
    countProfiles(supabase, "CHILD"),
    countProfiles(supabase, "MENTOR"),
    countProfiles(supabase, "INFLUENCER")
  ]);
  const { data: recentProfiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    throw new Error(`Unable to load recent registrations: ${error.message}`);
  }

  return {
    students,
    mentors,
    influencers,
    recentProfiles: (recentProfiles ?? []) as RecentProfile[]
  };
}

