import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/auth";

export type RecentProfile = {
  id: string;
  full_name: string | null;
  email: string;
  role: AppRole;
  created_at: string;
};

async function countProfiles(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, role?: AppRole) {
  let query = supabase.from("profiles").select("id", { count: "exact", head: true });

  if (role) {
    query = query.eq("role", role);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(`Unable to load profile count: ${error.message}`);
  }

  return count ?? 0;
}

export async function getStudentDashboardData(studentId: string) {
  const supabase = await createServerSupabaseClient();

  const [enrolledCourses, completedLessons, certificates, courseProgressRows] = await Promise.all([
    supabase.from("student_enrollments").select("id").eq("student_id", studentId),
    supabase.from("lesson_progress").select("id").eq("student_id", studentId).eq("status", "completed"),
    supabase.from("certificates").select("id").eq("student_id", studentId),
    supabase.from("course_progress").select("percent_complete").eq("student_id", studentId)
  ]);

  if (enrolledCourses.error) {
    throw new Error(`Unable to load enrollments: ${enrolledCourses.error.message}`);
  }

  if (completedLessons.error) {
    throw new Error(`Unable to load lesson progress: ${completedLessons.error.message}`);
  }

  if (certificates.error) {
    throw new Error(`Unable to load certificates: ${certificates.error.message}`);
  }

  if (courseProgressRows.error) {
    throw new Error(`Unable to load course progress: ${courseProgressRows.error.message}`);
  }

  const completion = courseProgressRows.data?.length
    ? Math.round(
        (courseProgressRows.data.reduce((total, row) => total + Number(row.percent_complete ?? 0), 0) /
          courseProgressRows.data.length) * 10
      ) / 10
    : 0;

  return {
    enrolledCourses: enrolledCourses.data?.length ?? 0,
    completedLessons: completedLessons.data?.length ?? 0,
    completion,
    certificates: certificates.data?.length ?? 0
  };
}

export async function getMentorDashboardData(mentorId: string) {
  const supabase = await createServerSupabaseClient();

  const [courses, enrollments, progressRows] = await Promise.all([
    supabase.from("courses").select("id").eq("mentor_id", mentorId),
    supabase.from("student_enrollments").select("student_id, course_id").in(
      "course_id",
      (await supabase.from("courses").select("id").eq("mentor_id", mentorId)).data?.map((course) => course.id) ?? []
    ),
    supabase.from("course_progress").select("course_id, percent_complete").in(
      "course_id",
      (await supabase.from("courses").select("id").eq("mentor_id", mentorId)).data?.map((course) => course.id) ?? []
    )
  ]);

  if (courses.error) {
    throw new Error(`Unable to load mentor courses: ${courses.error.message}`);
  }

  if (enrollments.error) {
    throw new Error(`Unable to load mentor enrollments: ${enrollments.error.message}`);
  }

  if (progressRows.error) {
    throw new Error(`Unable to load mentor progress: ${progressRows.error.message}`);
  }

  const learnerIds = new Set((enrollments.data ?? []).map((row) => row.student_id));
  const completionRate = progressRows.data?.length
    ? Math.round(
        progressRows.data.reduce((total, row) => total + Number(row.percent_complete ?? 0), 0) /
          progressRows.data.length
      )
    : 0;

  return {
    courseCount: courses.data?.length ?? 0,
    enrollments: enrollments.data?.length ?? 0,
    activeLearners: learnerIds.size,
    completionRate
  };
}

export async function getAdminDashboardData() {
  const supabase = await createServerSupabaseClient();
  const [students, mentors, influencers, courses, publishedCourses, enrollments, certificates] = await Promise.all([
    countProfiles(supabase, "CHILD"),
    countProfiles(supabase, "MENTOR"),
    countProfiles(supabase, "INFLUENCER"),
    supabase.from("courses").select("id"),
    supabase.from("courses").select("id").eq("status", "published"),
    supabase.from("student_enrollments").select("id"),
    supabase.from("certificates").select("id")
  ]);

  if (courses.error) {
    throw new Error(`Unable to load course count: ${courses.error.message}`);
  }

  if (publishedCourses.error) {
    throw new Error(`Unable to load published course count: ${publishedCourses.error.message}`);
  }

  if (enrollments.error) {
    throw new Error(`Unable to load enrollment count: ${enrollments.error.message}`);
  }

  if (certificates.error) {
    throw new Error(`Unable to load certificate count: ${certificates.error.message}`);
  }

  const { data: recentProfiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    throw new Error(`Unable to load recent registrations: ${error.message}`);
  }

  return {
    students,
    mentors,
    influencers,
    courses: courses.data?.length ?? 0,
    publishedCourses: publishedCourses.data?.length ?? 0,
    enrollments: enrollments.data?.length ?? 0,
    certificates: certificates.data?.length ?? 0,
    recentProfiles: (recentProfiles ?? []) as RecentProfile[]
  };
}

