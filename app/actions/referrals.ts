"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ReferralActionResult = {
  error?: string;
  success?: string;
  referralCode?: string;
};

export async function createReferralAction(
  _prevState: ReferralActionResult | undefined,
  formData: FormData
): Promise<ReferralActionResult> {
  const session = await getSessionUser();

  if (!session || (session.role !== "INFLUENCER" && session.role !== "ADMIN")) {
    return { error: "You do not have permission to manage referrals." };
  }

  const customCode = String(formData.get("referral_code") ?? "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");

  const referralCode = customCode || `REF-${session.id.slice(0, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("referrals").insert({
    influencer_id: session.id,
    referral_code: referralCode,
    status: "pending",
    amount_cents: 0
  });

  if (error) {
    return { error: `Unable to create referral link: ${error.message}` };
  }

  revalidatePath("/influencer");

  return {
    success: `Referral code "${referralCode}" created successfully!`,
    referralCode
  };
}
