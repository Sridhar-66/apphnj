"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ProgressActionResult = {
  error?: string;
  success?: string;
  certificateEarned?: boolean;
  percentComplete?: number;
};

export async function markLessonCompleteAction(
  courseId: string,
  lessonId: string
): Promise<ProgressActionResult> {
  const session = await getSessionUser();

  if (!session) {
    return { error: "You must be signed in to track progress." };
  }

  const supabase = await createServerSupabaseClient();

  // 1. Record lesson progress
  const { error: lessonProgressError } = await supabase
    .from("lesson_progress")
    .upsert(
      {
        student_id: session.id,
        lesson_id: lessonId,
        status: "completed",
        progress_percent: 100,
        completed_at: new Date().toISOString()
      },
      { onConflict: "student_id,lesson_id" }
    );

  if (lessonProgressError) {
    return { error: `Could not save lesson progress: ${lessonProgressError.message}` };
  }

  // 2. Fetch all lessons for this course to calculate overall percentage
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", courseId);

  const totalLessons = allLessons?.length ?? 1;
  const allLessonIds = (allLessons ?? []).map((l) => l.id);

  // 3. Count completed lessons for this course
  const { data: completedRows } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("student_id", session.id)
    .eq("status", "completed")
    .in("lesson_id", allLessonIds);

  const completedCount = completedRows?.length ?? 1;
  const percentComplete = Math.min(100, Math.round((completedCount / totalLessons) * 100));
  const courseStatus = percentComplete >= 100 ? "completed" : "in_progress";

  // 4. Update course_progress
  await supabase
    .from("course_progress")
    .upsert(
      {
        student_id: session.id,
        course_id: courseId,
        completed_lessons: completedCount,
        total_lessons: totalLessons,
        percent_complete: percentComplete,
        status: courseStatus
      },
      { onConflict: "student_id,course_id" }
    );

  // 5. Check if certificate should be issued
  let certificateEarned = false;
  if (percentComplete >= 100) {
    const { data: existingCert } = await supabase
      .from("certificates")
      .select("id")
      .eq("student_id", session.id)
      .eq("course_id", courseId)
      .maybeSingle();

    if (!existingCert) {
      const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
      const certCode = `CERT-${courseId.slice(0, 4).toUpperCase()}-${session.id.slice(0, 4).toUpperCase()}-${randomSuffix}`;

      const { error: certErr } = await supabase.from("certificates").insert({
        student_id: session.id,
        course_id: courseId,
        certificate_code: certCode
      });

      if (!certErr) {
        certificateEarned = true;
      }
    }
  }

  revalidatePath("/student");
  revalidatePath("/student/courses");
  revalidatePath(`/student/courses/${courseId}`);
  revalidatePath(`/student/courses/${courseId}/lessons/${lessonId}`);

  return {
    success: certificateEarned ? "Congratulations! You completed the course and earned a certificate!" : "Lesson completed!",
    certificateEarned,
    percentComplete
  };
}

export async function markLessonIncompleteAction(
  courseId: string,
  lessonId: string
): Promise<ProgressActionResult> {
  const session = await getSessionUser();

  if (!session) {
    return { error: "You must be signed in to track progress." };
  }

  const supabase = await createServerSupabaseClient();

  const { error: deleteError } = await supabase
    .from("lesson_progress")
    .upsert(
      {
        student_id: session.id,
        lesson_id: lessonId,
        status: "in_progress",
        progress_percent: 0,
        completed_at: null
      },
      { onConflict: "student_id,lesson_id" }
    );

  if (deleteError) {
    return { error: `Could not update progress: ${deleteError.message}` };
  }

  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", courseId);

  const totalLessons = allLessons?.length ?? 1;
  const allLessonIds = (allLessons ?? []).map((l) => l.id);

  const { data: completedRows } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("student_id", session.id)
    .eq("status", "completed")
    .in("lesson_id", allLessonIds);

  const completedCount = completedRows?.length ?? 0;
  const percentComplete = Math.min(100, Math.round((completedCount / totalLessons) * 100));
  const courseStatus = percentComplete === 0 ? "not_started" : "in_progress";

  await supabase
    .from("course_progress")
    .upsert(
      {
        student_id: session.id,
        course_id: courseId,
        completed_lessons: completedCount,
        total_lessons: totalLessons,
        percent_complete: percentComplete,
        status: courseStatus
      },
      { onConflict: "student_id,course_id" }
    );

  revalidatePath("/student");
  revalidatePath("/student/courses");
  revalidatePath(`/student/courses/${courseId}`);
  revalidatePath(`/student/courses/${courseId}/lessons/${lessonId}`);

  return { success: "Lesson marked as incomplete.", percentComplete };
}
