"use server";

import { revalidatePath } from "next/cache";
import { requireRole, normalizeRole, type AppRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type UserActionResult = {
  error?: string;
  success?: string;
};

const managedRoles: AppRole[] = ["ADMIN", "MENTOR", "CHILD", "INFLUENCER"];

export async function createUserAction(
  _prevState: UserActionResult | undefined,
  formData: FormData
): Promise<UserActionResult> {
  await requireRole("ADMIN");

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = normalizeRole(String(formData.get("role") ?? ""));

  if (!fullName) {
    return { error: "Please provide the user's full name." };
  }

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  if (password.length < 6) {
    return { error: "The password must be at least 6 characters long." };
  }

  if (!role || !managedRoles.includes(role)) {
    return { error: "Please choose a valid role." };
  }

  let supabaseAdmin;

  try {
    supabaseAdmin = createSupabaseAdminClient();
  } catch {
    return { error: "User creation is not configured on the server." };
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });

  if (error || !data.user) {
    return { error: error?.message ?? "Unable to create the user." };
  }

  const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
    id: data.user.id,
    email,
    full_name: fullName,
    role
  });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    return { error: `User was not created: ${profileError.message}` };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  return { success: `${fullName} was created as ${role}.` };
}
