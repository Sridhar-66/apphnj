"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser, roleToRoute } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AuthActionResult = {
  error?: string;
  success?: string;
};

function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function loginAction(
  _prevState: AuthActionResult | undefined,
  formData: FormData
): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  if (!hasSupabaseConfig()) {
    return { error: "Authentication is not configured. Add the Supabase environment variables and try again." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  const session = await getSessionUser();

  if (!session) {
    return { error: "Your account profile is unavailable. Please contact an administrator." };
  }

  revalidatePath("/", "layout");
  redirect(roleToRoute(session.role));
}

export async function registerAction(
  _prevState: AuthActionResult | undefined,
  formData: FormData
): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  if (!fullName) {
    return { error: "Please provide your full name." };
  }

  if (!hasSupabaseConfig()) {
    return { error: "Registration is not configured. Add the Supabase environment variables and try again." };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");

  if (data.session) {
    redirect("/student");
  }

  redirect("/login?registered=1");
}

export async function resetPasswordAction(
  _prevState: AuthActionResult | undefined,
  formData: FormData
): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  if (!hasSupabaseConfig()) {
    return { error: "Password reset is not configured. Add the Supabase environment variables and try again." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password`
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Password reset link sent." };
}

export async function logoutAction() {
  if (hasSupabaseConfig()) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
