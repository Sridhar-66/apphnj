import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { YouTubePlayer } from "@/components/youtube-player";
import { LessonCompleteButton } from "@/components/lesson-complete-button";
import { requireRole } from "@/lib/auth";
import { getLessonDetail, getCourseDetail } from "@/lib/course-data";

export const dynamic = "force-dynamic";

export default async function StudentLessonPlayerPage({
  params
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const session = await requireRole("CHILD");

  const [lessonData, courseData] = await Promise.all([
    getLessonDetail(lessonId, session.id),
    getCourseDetail(courseId, session.id)
  ]);

  if (!lessonData || !courseData) {
    notFound();
  }

  const { lesson, nextLessonId, prevLessonId } = lessonData;

  return (
    <DashboardShell role="CHILD" title={courseData.title} subtitle={`Lesson: ${lesson.title}`}>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href={`/student/courses/${courseId}`}
            className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"
          >
            ← Back to Course Overview
          </Link>

          <span className="text-xs text-slate-400">
            {courseData.completed_lessons_count} of {courseData.total_lessons_count} lessons completed ({courseData.progress_percent}%)
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Video & Content Area */}
          <div className="space-y-6 lg:col-span-2">
            {/* Video Player */}
            <YouTubePlayer url={lesson.youtube_url} title={lesson.title} />

            {/* Lesson Info Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xl font-bold text-white">{lesson.title}</h3>
                {lesson.duration_minutes > 0 ? (
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                    ⏱ {lesson.duration_minutes} minutes
                  </span>
                ) : null}
              </div>

              {lesson.description ? (
                <div className="text-sm leading-relaxed text-slate-300">
                  {lesson.description}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No additional lesson notes provided.</p>
              )}

              {/* Lesson Completion Action */}
              <div className="border-t border-slate-800 pt-4">
                <LessonCompleteButton
                  courseId={courseId}
                  lessonId={lessonId}
                  isCompleted={Boolean(lesson.is_completed)}
                  nextLessonId={nextLessonId}
                />
              </div>
            </div>

            {/* Materials & Resources */}
            {lesson.materials && lesson.materials.length > 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <h4 className="text-base font-semibold text-white">Lesson Resources & Materials</h4>
                <div className="mt-4 space-y-2">
                  {lesson.materials.map((mat) => (
                    <a
                      key={mat.id}
                      href={mat.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-200 transition hover:border-cyan-500/50 hover:text-cyan-300"
                    >
                      <div className="flex items-center gap-3">
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-xs uppercase font-medium text-slate-400">
                          {mat.kind}
                        </span>
                        <span>{mat.title}</span>
                      </div>
                      <span className="text-xs text-cyan-400">Open ↗</span>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Sidebar: Course Lessons Playlist */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <h4 className="font-semibold text-white">Course Lessons</h4>
              <p className="mt-1 text-xs text-slate-400">Track and jump to any lesson</p>

              <div className="mt-4 space-y-2">
                {courseData.lessons.map((item, idx) => {
                  const isCurrent = item.id === lessonId;
                  return (
                    <Link
                      key={item.id}
                      href={`/student/courses/${courseId}/lessons/${item.id}`}
                      className={`flex items-center justify-between rounded-xl border p-3 text-xs transition ${
                        isCurrent
                          ? "border-cyan-500/60 bg-cyan-950/30 text-cyan-200 font-medium"
                          : "border-slate-800/80 bg-slate-950/50 text-slate-300 hover:border-slate-700 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                          item.is_completed
                            ? "bg-emerald-500/20 text-emerald-400 font-bold"
                            : isCurrent
                            ? "bg-cyan-500 text-slate-950 font-bold"
                            : "bg-slate-800 text-slate-400"
                        }`}>
                          {item.is_completed ? "✓" : idx + 1}
                        </span>
                        <span className="line-clamp-1">{item.title}</span>
                      </div>

                      {item.duration_minutes > 0 ? (
                        <span className="text-[10px] text-slate-500">{item.duration_minutes}m</span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>

              {/* Prev / Next Navigation buttons */}
              <div className="mt-5 flex gap-2 border-t border-slate-800 pt-4">
                {prevLessonId ? (
                  <Link
                    href={`/student/courses/${courseId}/lessons/${prevLessonId}`}
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-950 py-2 text-center text-xs text-slate-300 hover:border-slate-700 hover:text-white"
                  >
                    ← Previous
                  </Link>
                ) : null}

                {nextLessonId ? (
                  <Link
                    href={`/student/courses/${courseId}/lessons/${nextLessonId}`}
                    className="flex-1 rounded-xl border border-cyan-500/40 bg-cyan-950/40 py-2 text-center text-xs font-semibold text-cyan-300 hover:bg-cyan-900/40"
                  >
                    Next Lesson →
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
