import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { AddLessonForm } from "@/components/add-lesson-form";
import { AddMaterialForm } from "@/components/add-material-form";
import { requireRole } from "@/lib/auth";
import { getCourseDetail, getMentorCourseLearners } from "@/lib/course-data";
import { deleteLessonAction } from "@/app/actions/lessons";
import { deleteMaterialAction } from "@/app/actions/materials";

export default async function MentorCourseDetailPage({
  params
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await requireRole("MENTOR");

  const [course, learners] = await Promise.all([
    getCourseDetail(courseId),
    getMentorCourseLearners(courseId)
  ]);

  if (!course) {
    notFound();
  }

  return (
    <DashboardShell role="MENTOR" title={course.title} subtitle={`Course slug: ${course.slug}`}>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link href="/mentor/courses" className="text-sm text-cyan-300 hover:text-cyan-200">
            ← Back to All Courses
          </Link>

          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs uppercase font-medium text-slate-300">
            Status: {course.status}
          </span>
        </div>

        {/* Course Info Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h3 className="text-xl font-bold text-white">{course.title}</h3>
          <p className="mt-2 text-sm text-slate-300">{course.description || "No description provided."}</p>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
            <span>Lessons: <strong className="text-white">{course.lessons.length}</strong></span>
            <span>Enrolled Students: <strong className="text-white">{learners.length}</strong></span>
            <span>Created: {new Date(course.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Add New Lesson Form */}
        <AddLessonForm courseId={courseId} />

        {/* Lesson List with Resource Uploads */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Course Lessons & Materials</h3>
            <span className="text-xs text-slate-400">{course.lessons.length} total lessons</span>
          </div>

          {course.lessons.length > 0 ? (
            <div className="space-y-4">
              {course.lessons.map((lesson, idx) => (
                <div key={lesson.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-300">
                          {idx + 1}
                        </span>
                        <h4 className="font-semibold text-white">{lesson.title}</h4>
                      </div>
                      {lesson.description ? (
                        <p className="mt-1 text-xs text-slate-400 pl-8">{lesson.description}</p>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-3 pl-8 sm:pl-0">
                      {lesson.duration_minutes > 0 ? (
                        <span className="text-xs text-slate-400">⏱ {lesson.duration_minutes}m</span>
                      ) : null}

                      <form action={async () => {
                        "use server";
                        await deleteLessonAction(courseId, lesson.id);
                      }}>
                        <button
                          type="submit"
                          className="rounded-lg border border-rose-900/40 bg-rose-950/30 px-2.5 py-1 text-xs text-rose-300 hover:bg-rose-900/40"
                        >
                          Delete Lesson
                        </button>
                      </form>
                    </div>
                  </div>

                  {lesson.youtube_url ? (
                    <div className="pl-8 text-xs text-slate-400">
                      Video: <span className="font-mono text-cyan-400">{lesson.youtube_url}</span>
                    </div>
                  ) : null}

                  {/* Materials for this lesson */}
                  <div className="border-t border-slate-800/80 pt-3 pl-8 space-y-3">
                    <AddMaterialForm lessonId={lesson.id} courseId={courseId} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No lessons have been created for this course yet. Use the form above to add your first lesson.</p>
          )}
        </div>

        {/* Enrolled Students & Learner Progress */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Enrolled Students & Progress</h3>
            <span className="text-xs text-slate-400">{learners.length} students</span>
          </div>

          {learners.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Enrolled Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Lessons Completed</th>
                    <th className="py-3 px-4">Overall Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {learners.map((learner) => (
                    <tr key={learner.studentId} className="hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-medium text-white">{learner.name}</td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {new Date(learner.enrolledAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300 uppercase font-medium">
                          {learner.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {learner.completedLessons} / {learner.totalLessons || course.lessons.length}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-800">
                            <div
                              className="h-full rounded-full bg-cyan-400"
                              style={{ width: `${learner.percentComplete}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">{learner.percentComplete}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">No students have enrolled in this course yet.</p>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
