import { createServerSupabaseClient } from "@/lib/supabase/server";

export type InfluencerDashboardData = {
  referralCode: string;
  totalReferrals: number;
  registeredStudents: number;
  conversions: number;
  conversionRate: number;
  totalEarnings: number;
  referralsList: Array<{
    id: string;
    referral_code: string;
    student_name: string | null;
    status: string;
    amount_cents: number;
    created_at: string;
  }>;
};

export async function getInfluencerDashboardData(influencerId: string): Promise<InfluencerDashboardData> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: referrals, error } = await supabase
      .from("referrals")
      .select("id, referral_code, student_id, status, amount_cents, created_at")
      .eq("influencer_id", influencerId)
      .order("created_at", { ascending: false });

    if (error || !referrals) {
      return {
        referralCode: `REF-${influencerId.slice(0, 8).toUpperCase()}`,
        totalReferrals: 0,
        registeredStudents: 0,
        conversions: 0,
        conversionRate: 0,
        totalEarnings: 0,
        referralsList: []
      };
    }

    const studentIds = referrals.map((r) => r.student_id).filter(Boolean) as string[];
    let studentMap = new Map<string, string | null>();

    if (studentIds.length > 0) {
      const { data: students } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", studentIds);

      if (students) {
        studentMap = new Map(students.map((s) => [s.id, s.full_name || s.email]));
      }
    }

    const totalReferrals = referrals.length;
    const registeredStudents = referrals.filter((r) => r.student_id !== null).length;
    const conversions = referrals.filter((r) => r.status === "converted" || r.status === "paid").length;
    const conversionRate = totalReferrals > 0 ? Math.round((conversions / totalReferrals) * 100) : 0;
    const totalEarnings = referrals.reduce((sum, r) => sum + (Number(r.amount_cents) || 0), 0) / 100;

    const primaryCode = referrals.length > 0
      ? referrals[0].referral_code
      : `REF-${influencerId.slice(0, 8).toUpperCase()}`;

    return {
      referralCode: primaryCode,
      totalReferrals,
      registeredStudents,
      conversions,
      conversionRate,
      totalEarnings,
      referralsList: referrals.map((r) => ({
        id: r.id,
        referral_code: r.referral_code,
        student_name: r.student_id ? studentMap.get(r.student_id) ?? "Student" : null,
        status: r.status,
        amount_cents: r.amount_cents,
        created_at: r.created_at
      }))
    };
  } catch {
    return {
      referralCode: `REF-${influencerId.slice(0, 8).toUpperCase()}`,
      totalReferrals: 0,
      registeredStudents: 0,
      conversions: 0,
      conversionRate: 0,
      totalEarnings: 0,
      referralsList: []
    };
  }
}
