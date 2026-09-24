"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDemoSessionCookie, normalizeRole, roleToRoute, type AppRole } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AuthActionResult = {
  error?: string;
  success?: string;
};

const demoRoleFromForm = (value: FormDataEntryValue | null): AppRole => {
  const role = normalizeRole(typeof value === "string" ? value : null) ?? "CHILD";
  return role;
};

async function setDemoSession(email: string, fullName: string, role: AppRole) {
  const cookieStore = await cookies();
  cookieStore.set(getDemoSessionCookie(), JSON.stringify({
    id: `demo-${Date.now()}`,
    email,
    full_name: fullName,
    role
  }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function loginAction(
  _prevState: AuthActionResult | undefined,
  formData: FormData
): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = demoRoleFromForm(formData.get("role"));

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/", "layout");
    redirect(roleToRoute(role));
  }

  await setDemoSession(email, email.split("@")[0], role);
  revalidatePath("/", "layout");
  redirect(roleToRoute(role));
}

export async function registerAction(
  _prevState: AuthActionResult | undefined,
  formData: FormData
): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = demoRoleFromForm(formData.get("role"));

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  if (!fullName) {
    return { error: "Please provide your full name." };
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role
        }
      }
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/", "layout");
    redirect(roleToRoute(role));
  }

  await setDemoSession(email, fullName, role);
  revalidatePath("/", "layout");
  redirect(roleToRoute(role));
}

export async function resetPasswordAction(
  _prevState: AuthActionResult | undefined,
  formData: FormData
): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password`
    });

    if (error) {
      return { error: error.message };
    }

    return { success: "Password reset link sent." };
  }

  return { success: "Password reset is ready for Supabase configuration." };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(getDemoSessionCookie());

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
