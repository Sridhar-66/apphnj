import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { EnrollButton } from "@/components/enroll-button";
import { requireRole } from "@/lib/auth";
import { getCourseDetail } from "@/lib/course-data";

export default async function StudentCourseDetailPage({
  params
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await requireRole("CHILD");
  const course = await getCourseDetail(courseId, session.id);

  if (!course) {
    notFound();
  }

  const firstLesson = course.lessons[0];

  return (
    <DashboardShell role="CHILD" title={course.title} subtitle={`Mentor: ${course.mentor_name || "Assigned Instructor"}`}>
      <div className="space-y-6">
        {/* Certificate Banner if Course Completed */}
        {course.certificate ? (
          <div className="rounded-2xl border border-emerald-500/50 bg-emerald-950/40 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Course Completed 🎉
                </span>
                <h3 className="mt-2 text-xl font-bold text-white">Certificate of Completion Issued</h3>
                <p className="mt-1 text-sm text-slate-300">
                  Verification Code: <span className="font-mono text-emerald-400">{course.certificate.certificate_code}</span>
                </p>
              </div>
              <Link
                href="/student/certificates"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
              >
                View Certificate
              </Link>
            </div>
          </div>
        ) : null}

        {/* Course Overview Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Course Overview</p>
              <h3 className="mt-1 text-2xl font-bold text-white">{course.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{course.description || "No description provided."}</p>
            </div>

            <div>
              {course.is_enrolled ? (
                firstLesson ? (
                  <Link
                    href={`/student/courses/${course.id}/lessons/${firstLesson.id}`}
                    className="inline-flex rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                  >
                    {course.progress_percent > 0 ? "Continue Learning →" : "Start Learning →"}
                  </Link>
                ) : (
                  <span className="text-xs text-slate-400">No lessons published yet</span>
                )
              ) : (
                <EnrollButton courseId={course.id} isEnrolled={false} />
              )}
            </div>
          </div>

          {/* Progress Bar if Enrolled */}
          {course.is_enrolled ? (
            <div className="mt-6 border-t border-slate-800 pt-5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Progress: {course.completed_lessons_count} of {course.total_lessons_count} lessons</span>
                <span className="font-semibold text-cyan-300">{course.progress_percent}% Complete</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${course.progress_percent}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Curriculum Modules & Lessons */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Course Curriculum</h3>
            <span className="text-xs text-slate-400">{course.lessons.length} lessons total</span>
          </div>

          {course.lessons.length > 0 ? (
            <div className="mt-5 space-y-4">
              {course.modules.map((module) => (
                <div key={module.id} className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                  <h4 className="font-medium text-slate-200">{module.title}</h4>

                  <div className="mt-3 space-y-2">
                    {module.lessons.map((lesson, idx) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-900/50 px-4 py-3 text-sm transition hover:border-slate-700"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                            lesson.is_completed
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-slate-800 text-slate-400"
                          }`}>
                            {lesson.is_completed ? "✓" : idx + 1}
                          </span>
                          <span className="text-slate-200">{lesson.title}</span>
                          {lesson.duration_minutes > 0 ? (
                            <span className="text-xs text-slate-500">({lesson.duration_minutes}m)</span>
                          ) : null}
                        </div>

                        {course.is_enrolled ? (
                          <Link
                            href={`/student/courses/${course.id}/lessons/${lesson.id}`}
                            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 transition hover:border-cyan-500/50 hover:text-cyan-300"
                          >
                            {lesson.is_completed ? "Review" : "Learn"} →
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-500">Enroll to access</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">Curriculum is being prepared for this course.</p>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
