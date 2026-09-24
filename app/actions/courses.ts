"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type CourseActionResult = {
  error?: string;
  success?: string;
};

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export async function createCourseAction(
  _prevState: CourseActionResult | undefined,
  formData: FormData
): Promise<CourseActionResult> {
  const session = await getSessionUser();

  if (!session || (session.role !== "ADMIN" && session.role !== "MENTOR")) {
    return { error: "You do not have permission to create courses." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "draft");

  if (!title) {
    return { error: "Please provide a course title." };
  }

  const slug = normalizeSlug(title) || "new-course";
  const safeStatus = status === "published" || status === "draft" || status === "archived" ? status : "draft";
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("courses").insert({
    title,
    slug: `${slug}-${Date.now().toString().slice(-6)}`,
    description: description || null,
    status: safeStatus,
    created_by: session.id,
    mentor_id: session.id
  });

  if (error) {
    return { error: `Unable to create the course: ${error.message}` };
  }

  revalidatePath("/mentor");
  revalidatePath("/mentor/courses");
  revalidatePath("/admin");
  revalidatePath("/admin/courses");

  return { success: `Course "${title}" was created.` };
}
