"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type LessonActionResult = {
  error?: string;
  success?: string;
};

export async function createLessonAction(
  _prevState: LessonActionResult | undefined,
  formData: FormData
): Promise<LessonActionResult> {
  const session = await getSessionUser();

  if (!session || (session.role !== "ADMIN" && session.role !== "MENTOR")) {
    return { error: "You do not have permission to manage lessons." };
  }

  const courseId = String(formData.get("course_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const durationMinutes = Number(formData.get("duration_minutes") ?? 0) || 0;
  const youtubeUrl = String(formData.get("youtube_url") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0) || 0;

  if (!courseId) {
    return { error: "Course identifier is missing." };
  }

  if (!title) {
    return { error: "Please provide a lesson title." };
  }

  const supabase = await createServerSupabaseClient();

  // Verify mentor owns course or user is admin
  const { data: course, error: courseErr } = await supabase
    .from("courses")
    .select("id, mentor_id")
    .eq("id", courseId)
    .single();

  if (courseErr || !course) {
    return { error: "Course not found." };
  }

  if (session.role !== "ADMIN" && course.mentor_id !== session.id) {
    return { error: "You are not authorized to modify this course." };
  }

  const { error: insertError } = await supabase.from("lessons").insert({
    course_id: courseId,
    title,
    description: description || null,
    duration_minutes: durationMinutes,
    youtube_url: youtubeUrl || null,
    sort_order: sortOrder
  });

  if (insertError) {
    return { error: `Failed to create lesson: ${insertError.message}` };
  }

  // Update total_lessons on all existing course_progress records
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", courseId);

  const total = allLessons?.length ?? 1;

  await supabase
    .from("course_progress")
    .update({ total_lessons: total })
    .eq("course_id", courseId);

  revalidatePath(`/mentor/courses/${courseId}`);
  revalidatePath("/mentor/courses");
  revalidatePath(`/student/courses/${courseId}`);

  return { success: `Lesson "${title}" created successfully.` };
}

export async function deleteLessonAction(
  courseId: string,
  lessonId: string
): Promise<LessonActionResult> {
  const session = await getSessionUser();

  if (!session || (session.role !== "ADMIN" && session.role !== "MENTOR")) {
    return { error: "You do not have permission to delete lessons." };
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("lessons")
    .delete()
    .eq("id", lessonId)
    .eq("course_id", courseId);

  if (error) {
    return { error: `Failed to delete lesson: ${error.message}` };
  }

  revalidatePath(`/mentor/courses/${courseId}`);
  revalidatePath("/mentor/courses");
  revalidatePath(`/student/courses/${courseId}`);

  return { success: "Lesson deleted successfully." };
}
