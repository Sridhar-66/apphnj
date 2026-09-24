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
  try {
    const supabase = await createServerSupabaseClient();

    const { data: courses, error: courseError } = await supabase
      .from("courses")
      .select("id, title, slug, description, status, created_at, mentor_id")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (courseError || !courses?.length) {
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
        : Promise.resolve({ data: [] as Array<{ id: string; full_name: string | null }>, error: null })
    ]);

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
  } catch {
    return [];
  }
}

export async function getMentorCourseList(mentorId: string): Promise<CourseListItem[]> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: courses, error } = await supabase
      .from("courses")
      .select("id, title, slug, description, status, created_at, mentor_id")
      .eq("mentor_id", mentorId)
      .order("created_at", { ascending: false });

    if (error || !courses?.length) {
      return [];
    }

    const courseIds = courses.map((course) => course.id);
    const [lessonRows, enrollmentRows] = await Promise.all([
      supabase.from("lessons").select("course_id").in("course_id", courseIds),
      supabase.from("student_enrollments").select("course_id").in("course_id", courseIds)
    ]);

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
  } catch {
    return [];
  }
}

export async function getAdminCourseList(): Promise<CourseListItem[]> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: courses, error } = await supabase
      .from("courses")
      .select("id, title, slug, description, status, created_at, mentor_id")
      .order("created_at", { ascending: false });

    if (error || !courses?.length) {
      return [];
    }

    const mentorIds = [...new Set(courses.map((course) => course.mentor_id).filter(Boolean) as string[])];
    const [lessonRows, enrollmentRows, mentorProfiles] = await Promise.all([
      supabase.from("lessons").select("course_id").in("course_id", courses.map((course) => course.id)),
      supabase.from("student_enrollments").select("course_id").in("course_id", courses.map((course) => course.id)),
      mentorIds.length
        ? supabase.from("profiles").select("id, full_name").in("id", mentorIds)
        : Promise.resolve({ data: [] as Array<{ id: string; full_name: string | null }>, error: null })
    ]);

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
  } catch {
    return [];
  }
}

export type LessonItem = {
  id: string;
  course_id: string;
  module_id: string | null;
  title: string;
  description: string | null;
  duration_minutes: number;
  youtube_url: string | null;
  sort_order: number;
  created_at: string;
  is_completed?: boolean;
  materials?: LessonMaterialItem[];
};

export type LessonMaterialItem = {
  id: string;
  lesson_id: string;
  title: string;
  kind: "article" | "pdf" | "video" | "link";
  file_url: string;
  sort_order: number;
  created_at: string;
};

export type CourseModuleItem = {
  id: string;
  course_id: string;
  title: string;
  sort_order: number;
  lessons: LessonItem[];
};

export type CourseDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: CourseStatus;
  created_at: string;
  mentor_id: string | null;
  mentor_name: string | null;
  modules: CourseModuleItem[];
  lessons: LessonItem[];
  is_enrolled: boolean;
  progress_percent: number;
  completed_lessons_count: number;
  total_lessons_count: number;
  certificate?: {
    id: string;
    certificate_code: string;
    issued_at: string;
  } | null;
};

export type CertificateItem = {
  id: string;
  certificate_code: string;
  issued_at: string;
  course_id: string;
  course_title: string;
  course_slug: string;
  student_name: string;
};

export async function getCourseDetail(courseId: string, studentId?: string): Promise<CourseDetail | null> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: course, error } = await supabase
      .from("courses")
      .select("id, slug, title, description, status, created_at, mentor_id")
      .eq("id", courseId)
      .single();

    if (error || !course) {
      return null;
    }

    let mentorName: string | null = null;
    if (course.mentor_id) {
      const { data: mentor } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", course.mentor_id)
        .single();
      mentorName = mentor?.full_name ?? null;
    }

    const [modulesRes, lessonsRes, enrollRes, progressRes, certRes] = await Promise.all([
      supabase.from("course_modules").select("*").eq("course_id", courseId).order("sort_order", { ascending: true }),
      supabase.from("lessons").select("*").eq("course_id", courseId).order("sort_order", { ascending: true }),
      studentId
        ? supabase.from("student_enrollments").select("id, status").eq("course_id", courseId).eq("student_id", studentId).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      studentId
        ? supabase.from("lesson_progress").select("lesson_id, status").eq("student_id", studentId)
        : Promise.resolve({ data: null, error: null }),
      studentId
        ? supabase.from("certificates").select("id, certificate_code, issued_at").eq("course_id", courseId).eq("student_id", studentId).maybeSingle()
        : Promise.resolve({ data: null, error: null })
    ]);

    const completedLessonIds = new Set(
      (progressRes.data ?? [])
        .filter((lp) => lp.status === "completed")
        .map((lp) => lp.lesson_id)
    );

    const lessons: LessonItem[] = (lessonsRes.data ?? []).map((lesson) => ({
      ...lesson,
      is_completed: completedLessonIds.has(lesson.id)
    }));

    const modules: CourseModuleItem[] = (modulesRes.data ?? []).map((mod) => ({
      ...mod,
      lessons: lessons.filter((l) => l.module_id === mod.id)
    }));

    const unassignedLessons = lessons.filter((l) => !l.module_id);
    if (unassignedLessons.length > 0 && modules.length > 0) {
      modules.push({
        id: "general",
        course_id: courseId,
        title: "Additional Lessons",
        sort_order: 999,
        lessons: unassignedLessons
      });
    }

    const totalLessons = lessons.length;
    const completedCount = lessons.filter((l) => l.is_completed).length;
    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      status: course.status as CourseStatus,
      created_at: course.created_at,
      mentor_id: course.mentor_id,
      mentor_name: mentorName,
      modules: modules.length > 0 ? modules : [{ id: "main", course_id: courseId, title: "Course Content", sort_order: 1, lessons }],
      lessons,
      is_enrolled: Boolean(enrollRes.data),
      progress_percent: progressPercent,
      completed_lessons_count: completedCount,
      total_lessons_count: totalLessons,
      certificate: certRes.data ?? null
    };
  } catch {
    return null;
  }
}

export async function getLessonDetail(
  lessonId: string,
  studentId?: string
): Promise<{ lesson: LessonItem; course: { id: string; title: string; slug: string }; nextLessonId: string | null; prevLessonId: string | null } | null> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: lesson, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .single();

    if (error || !lesson) {
      return null;
    }

    const [courseRes, materialsRes, progressRes, allLessonsRes] = await Promise.all([
      supabase.from("courses").select("id, title, slug").eq("id", lesson.course_id).single(),
      supabase.from("lesson_materials").select("*").eq("lesson_id", lessonId).order("sort_order", { ascending: true }),
      studentId
        ? supabase.from("lesson_progress").select("status").eq("student_id", studentId).eq("lesson_id", lessonId).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      supabase.from("lessons").select("id, sort_order").eq("course_id", lesson.course_id).order("sort_order", { ascending: true })
    ]);

    if (!courseRes.data) {
      return null;
    }

    const allLessons = allLessonsRes.data ?? [];
    const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
    const prevLessonId = currentIndex > 0 ? allLessons[currentIndex - 1].id : null;
    const nextLessonId = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1].id : null;

    return {
      lesson: {
        ...lesson,
        is_completed: progressRes.data?.status === "completed",
        materials: (materialsRes.data ?? []) as LessonMaterialItem[]
      },
      course: courseRes.data,
      nextLessonId,
      prevLessonId
    };
  } catch {
    return null;
  }
}

export async function getStudentCertificates(studentId: string): Promise<CertificateItem[]> {
  try {
    const supabase = await createServerSupabaseClient();

    const [certsRes, profileRes] = await Promise.all([
      supabase
        .from("certificates")
        .select("id, certificate_code, issued_at, course_id")
        .eq("student_id", studentId)
        .order("issued_at", { ascending: false }),
      supabase.from("profiles").select("full_name").eq("id", studentId).single()
    ]);

    const certs = certsRes.data ?? [];
    if (!certs.length) return [];

    const courseIds = certs.map((c) => c.course_id);
    const { data: courses } = await supabase
      .from("courses")
      .select("id, title, slug")
      .in("id", courseIds);

    const courseMap = new Map((courses ?? []).map((c) => [c.id, c]));
    const studentName = profileRes.data?.full_name ?? "Student";

    return certs.map((c) => {
      const course = courseMap.get(c.course_id);
      return {
        id: c.id,
        certificate_code: c.certificate_code,
        issued_at: c.issued_at,
        course_id: c.course_id,
        course_title: course?.title ?? "Course",
        course_slug: course?.slug ?? "",
        student_name: studentName
      };
    });
  } catch {
    return [];
  }
}

export async function getMentorCourseLearners(courseId: string) {
  try {
    const supabase = await createServerSupabaseClient();

    const [enrollmentsRes, progressRes] = await Promise.all([
      supabase.from("student_enrollments").select("student_id, status, enrolled_at").eq("course_id", courseId),
      supabase.from("course_progress").select("student_id, completed_lessons, total_lessons, percent_complete, status").eq("course_id", courseId)
    ]);

    const enrollments = enrollmentsRes.data ?? [];
    if (!enrollments.length) return [];

    const studentIds = enrollments.map((e) => e.student_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", studentIds);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    const progressMap = new Map((progressRes.data ?? []).map((p) => [p.student_id, p]));

    return enrollments.map((e) => {
      const profile = profileMap.get(e.student_id);
      const progress = progressMap.get(e.student_id);
      return {
        studentId: e.student_id,
        name: profile?.full_name || profile?.email || "Student",
        email: profile?.email || "",
        enrolledAt: e.enrolled_at,
        status: e.status,
        percentComplete: progress?.percent_complete ?? 0,
        completedLessons: progress?.completed_lessons ?? 0,
        totalLessons: progress?.total_lessons ?? 0
      };
    });
  } catch {
    return [];
  }
}
