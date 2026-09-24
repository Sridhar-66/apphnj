"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type MaterialActionResult = {
  error?: string;
  success?: string;
};

export async function createMaterialAction(
  _prevState: MaterialActionResult | undefined,
  formData: FormData
): Promise<MaterialActionResult> {
  const session = await getSessionUser();

  if (!session || (session.role !== "ADMIN" && session.role !== "MENTOR")) {
    return { error: "You do not have permission to manage materials." };
  }

  const lessonId = String(formData.get("lesson_id") ?? "").trim();
  const courseId = String(formData.get("course_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const kind = String(formData.get("kind") ?? "link") as "article" | "pdf" | "video" | "link";
  const fileUrl = String(formData.get("file_url") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0) || 0;

  if (!lessonId) {
    return { error: "Lesson identifier is missing." };
  }

  if (!title) {
    return { error: "Please provide a material title." };
  }

  if (!fileUrl) {
    return { error: "Please provide a valid material URL." };
  }

  const validKinds = ["article", "pdf", "video", "link"];
  const safeKind = validKinds.includes(kind) ? kind : "link";

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("lesson_materials").insert({
    lesson_id: lessonId,
    title,
    kind: safeKind,
    file_url: fileUrl,
    sort_order: sortOrder
  });

  if (error) {
    return { error: `Failed to add material: ${error.message}` };
  }

  if (courseId) {
    revalidatePath(`/mentor/courses/${courseId}`);
    revalidatePath(`/student/courses/${courseId}`);
    revalidatePath(`/student/courses/${courseId}/lessons/${lessonId}`);
  }

  return { success: `Material "${title}" added successfully.` };
}

export async function deleteMaterialAction(
  materialId: string,
  courseId?: string,
  lessonId?: string
): Promise<MaterialActionResult> {
  const session = await getSessionUser();

  if (!session || (session.role !== "ADMIN" && session.role !== "MENTOR")) {
    return { error: "You do not have permission to delete materials." };
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("lesson_materials")
    .delete()
    .eq("id", materialId);

  if (error) {
    return { error: `Failed to delete material: ${error.message}` };
  }

  if (courseId) {
    revalidatePath(`/mentor/courses/${courseId}`);
    revalidatePath(`/student/courses/${courseId}`);
  }
  if (lessonId && courseId) {
    revalidatePath(`/student/courses/${courseId}/lessons/${lessonId}`);
  }

  return { success: "Material removed successfully." };
}
