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
    // Return 0 instead of throwing — table may not exist yet.
    return 0;
  }

  return count ?? 0;
}

export async function getStudentDashboardData(studentId: string) {
  try {
    const supabase = await createServerSupabaseClient();

    const [enrolledCourses, completedLessons, certificates, courseProgressRows] = await Promise.all([
      supabase.from("student_enrollments").select("id").eq("student_id", studentId),
      supabase.from("lesson_progress").select("id").eq("student_id", studentId).eq("status", "completed"),
      supabase.from("certificates").select("id").eq("student_id", studentId),
      supabase.from("course_progress").select("percent_complete").eq("student_id", studentId)
    ]);

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
  } catch {
    // Return safe empty state if the DB is unreachable or tables don't exist yet.
    return {
      enrolledCourses: 0,
      completedLessons: 0,
      completion: 0,
      certificates: 0
    };
  }
}

export async function getMentorDashboardData(mentorId: string) {
  try {
    const supabase = await createServerSupabaseClient();

    // Fetch mentor's course IDs first, then use them for dependent queries.
    const { data: mentorCourses, error: mentorCoursesError } = await supabase
      .from("courses")
      .select("id")
      .eq("mentor_id", mentorId);

    if (mentorCoursesError) {
      return { courseCount: 0, enrollments: 0, activeLearners: 0, completionRate: 0 };
    }

    const courseIds = (mentorCourses ?? []).map((course) => course.id);

    if (!courseIds.length) {
      return { courseCount: 0, enrollments: 0, activeLearners: 0, completionRate: 0 };
    }

    const [enrollments, progressRows] = await Promise.all([
      supabase.from("student_enrollments").select("student_id, course_id").in("course_id", courseIds),
      supabase.from("course_progress").select("course_id, percent_complete").in("course_id", courseIds)
    ]);

    const learnerIds = new Set((enrollments.data ?? []).map((row) => row.student_id));
    const completionRate = progressRows.data?.length
      ? Math.round(
          progressRows.data.reduce((total, row) => total + Number(row.percent_complete ?? 0), 0) /
            progressRows.data.length
        )
      : 0;

    return {
      courseCount: courseIds.length,
      enrollments: enrollments.data?.length ?? 0,
      activeLearners: learnerIds.size,
      completionRate
    };
  } catch {
    return { courseCount: 0, enrollments: 0, activeLearners: 0, completionRate: 0 };
  }
}

export async function getAdminDashboardData() {
  try {
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

    const { data: recentProfiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

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
  } catch {
    return {
      students: 0,
      mentors: 0,
      influencers: 0,
      courses: 0,
      publishedCourses: 0,
      enrollments: 0,
      certificates: 0,
      recentProfiles: [] as RecentProfile[]
    };
  }
}
