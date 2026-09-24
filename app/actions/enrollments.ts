"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type EnrollmentActionResult = {
  error?: string;
  success?: string;
};

export async function enrollCourseAction(courseId: string): Promise<EnrollmentActionResult> {
  const session = await getSessionUser();

  if (!session) {
    return { error: "You must be signed in to enroll in a course." };
  }

  if (session.role !== "CHILD" && session.role !== "ADMIN") {
    return { error: "Only students may enroll in courses." };
  }

  const supabase = await createServerSupabaseClient();

  // Verify course exists and is published
  const { data: course, error: courseErr } = await supabase
    .from("courses")
    .select("id, title, status")
    .eq("id", courseId)
    .single();

  if (courseErr || !course || course.status !== "published") {
    return { error: "This course is not available for enrollment." };
  }

  // Insert enrollment
  const { error: enrollError } = await supabase
    .from("student_enrollments")
    .insert({
      student_id: session.id,
      course_id: courseId,
      status: "active"
    });

  if (enrollError) {
    if (enrollError.code === "23505") {
      return { success: "You are already enrolled in this course." };
    }
    return { error: `Unable to enroll: ${enrollError.message}` };
  }

  // Count lessons in course to initialize course_progress
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", courseId);

  const totalLessons = lessons?.length ?? 0;

  // Initialize course progress
  await supabase
    .from("course_progress")
    .upsert({
      student_id: session.id,
      course_id: courseId,
      completed_lessons: 0,
      total_lessons: totalLessons,
      percent_complete: 0,
      status: "not_started"
    }, { onConflict: "student_id,course_id" });

  revalidatePath("/student");
  revalidatePath("/student/courses");
  revalidatePath(`/student/courses/${courseId}`);

  return { success: `Successfully enrolled in "${course.title}".` };
}
