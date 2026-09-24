import { createServerSupabaseClient } from "@/lib/supabase/server";

export type CourseStatus = "draft" | "published" | "archived";

export type CourseListItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: CourseStatus;
  created_at: string;
  mentor_name: string | null;
  lesson_count: number;
  enrollment_count: number;
  enrolled: boolean;
  progress_percent: number;
};

function buildCourseMap<T>(rows: Array<{ course_id: string } & T> | null | undefined) {
  const map = new Map<string, number>();

  for (const row of rows ?? []) {
    map.set(row.course_id, (map.get(row.course_id) ?? 0) + 1);
  }

  return map;
}

export async function getStudentCourseList(studentId: string): Promise<CourseListItem[]> {
  const supabase = await createServerSupabaseClient();

  const { data: courses, error: courseError } = await supabase
    .from("courses")
    .select("id, title, slug, description, status, created_at, mentor_id")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (courseError) {
    throw new Error(`Unable to load courses: ${courseError.message}`);
  }

  if (!courses?.length) {
    return [];
  }

  const courseIds = courses.map((course) => course.id);
  const mentorIds = [...new Set(courses.map((course) => course.mentor_id).filter(Boolean) as string[])];

  const [lessonRows, enrollmentRows, studentEnrollments, courseProgressRows, mentorProfiles] = await Promise.all([
    supabase.from("lessons").select("course_id").in("course_id", courseIds),
    supabase.from("student_enrollments").select("course_id").in("course_id", courseIds),
    supabase.from("student_enrollments").select("course_id, status").eq("student_id", studentId).in("course_id", courseIds),
    supabase.from("course_progress").select("course_id, percent_complete").eq("student_id", studentId).in("course_id", courseIds),
    mentorIds.length
      ? supabase.from("profiles").select("id, full_name").in("id", mentorIds)
      : Promise.resolve({ data: [] as Array<{ id: string; full_name: string | null }> })
  ]);

  if (lessonRows.error) {
    throw new Error(`Unable to load lesson counts: ${lessonRows.error.message}`);
  }

  if (enrollmentRows.error) {
    throw new Error(`Unable to load enrollment counts: ${enrollmentRows.error.message}`);
  }

  if (studentEnrollments.error) {
    throw new Error(`Unable to load your enrollments: ${studentEnrollments.error.message}`);
  }

  if (courseProgressRows.error) {
    throw new Error(`Unable to load your progress: ${courseProgressRows.error.message}`);
  }

  if ("error" in mentorProfiles && mentorProfiles.error) {
    throw new Error(`Unable to load mentor details: ${mentorProfiles.error.message}`);
  }

  const lessonCounts = buildCourseMap<{ course_id: string }>(lessonRows.data ?? []);
  const enrollmentCounts = buildCourseMap<{ course_id: string }>(enrollmentRows.data ?? []);
  const enrollmentMap = new Map((studentEnrollments.data ?? []).map((row) => [row.course_id, row.status]));
  const progressMap = new Map((courseProgressRows.data ?? []).map((row) => [row.course_id, Number(row.percent_complete) || 0]));
  const mentorMap = new Map((mentorProfiles.data ?? []).map((mentor) => [mentor.id, mentor.full_name]));

  return courses.map((course) => ({
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    status: course.status as CourseStatus,
    created_at: course.created_at,
    mentor_name: course.mentor_id ? mentorMap.get(course.mentor_id) ?? null : null,
    lesson_count: lessonCounts.get(course.id) ?? 0,
    enrollment_count: enrollmentCounts.get(course.id) ?? 0,
    enrolled: enrollmentMap.has(course.id),
    progress_percent: progressMap.get(course.id) ?? 0
  }));
}

export async function getMentorCourseList(mentorId: string): Promise<CourseListItem[]> {
  const supabase = await createServerSupabaseClient();

  const { data: courses, error } = await supabase
    .from("courses")
    .select("id, title, slug, description, status, created_at, mentor_id")
    .eq("mentor_id", mentorId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load mentor courses: ${error.message}`);
  }

  if (!courses?.length) {
    return [];
  }

  const lessonRows = await supabase.from("lessons").select("course_id").in("course_id", courses.map((course) => course.id));
  const enrollmentRows = await supabase.from("student_enrollments").select("course_id").in("course_id", courses.map((course) => course.id));

  if (lessonRows.error) {
    throw new Error(`Unable to load lesson counts: ${lessonRows.error.message}`);
  }

  if (enrollmentRows.error) {
    throw new Error(`Unable to load enrollment counts: ${enrollmentRows.error.message}`);
  }

  const lessonCounts = buildCourseMap<{ course_id: string }>(lessonRows.data ?? []);
  const enrollmentCounts = buildCourseMap<{ course_id: string }>(enrollmentRows.data ?? []);

  return courses.map((course) => ({
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    status: course.status as CourseStatus,
    created_at: course.created_at,
    mentor_name: "You",
    lesson_count: lessonCounts.get(course.id) ?? 0,
    enrollment_count: enrollmentCounts.get(course.id) ?? 0,
    enrolled: true,
    progress_percent: 0
  }));
}

export async function getAdminCourseList(): Promise<CourseListItem[]> {
  const supabase = await createServerSupabaseClient();

  const { data: courses, error } = await supabase
    .from("courses")
    .select("id, title, slug, description, status, created_at, mentor_id")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load courses: ${error.message}`);
  }

  if (!courses?.length) {
    return [];
  }

  const mentorIds = [...new Set(courses.map((course) => course.mentor_id).filter(Boolean) as string[])];
  const [lessonRows, enrollmentRows, mentorProfiles] = await Promise.all([
    supabase.from("lessons").select("course_id").in("course_id", courses.map((course) => course.id)),
    supabase.from("student_enrollments").select("course_id").in("course_id", courses.map((course) => course.id)),
    mentorIds.length
      ? supabase.from("profiles").select("id, full_name").in("id", mentorIds)
      : Promise.resolve({ data: [] as Array<{ id: string; full_name: string | null }> })
  ]);

  if (lessonRows.error) {
    throw new Error(`Unable to load lesson counts: ${lessonRows.error.message}`);
  }

  if (enrollmentRows.error) {
    throw new Error(`Unable to load enrollment counts: ${enrollmentRows.error.message}`);
  }

  if ("error" in mentorProfiles && mentorProfiles.error) {
    throw new Error(`Unable to load mentor profiles: ${mentorProfiles.error.message}`);
  }

  const lessonCounts = buildCourseMap<{ course_id: string }>(lessonRows.data ?? []);
  const enrollmentCounts = buildCourseMap<{ course_id: string }>(enrollmentRows.data ?? []);
  const mentorMap = new Map((mentorProfiles.data ?? []).map((mentor) => [mentor.id, mentor.full_name]));

  return courses.map((course) => ({
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    status: course.status as CourseStatus,
    created_at: course.created_at,
    mentor_name: course.mentor_id ? mentorMap.get(course.mentor_id) ?? null : null,
    lesson_count: lessonCounts.get(course.id) ?? 0,
    enrollment_count: enrollmentCounts.get(course.id) ?? 0,
    enrolled: false,
    progress_percent: 0
  }));
}
