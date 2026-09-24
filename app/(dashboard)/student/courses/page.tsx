import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireRole } from "@/lib/auth";
import { getStudentCourseList } from "@/lib/course-data";

export default async function StudentCoursesPage() {
  const session = await requireRole("CHILD");
  const courses = await getStudentCourseList(session.id);

  return (
    <DashboardShell role="CHILD" title="Browse courses" subtitle={`Signed in as ${session.full_name}.`}>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">Available learning paths</h3>
          <Link href="/student" className="text-sm text-cyan-300 hover:text-cyan-200">Back to dashboard</Link>
        </div>

        {courses.length ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {courses.map((course) => (
              <article key={course.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">{course.status}</p>
                    <h4 className="mt-2 text-xl font-semibold text-white">{course.title}</h4>
                  </div>
                  {course.enrolled ? (
                    <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-300">
                      Enrolled
                    </span>
                  ) : null}
                </div>

                <p className="mt-3 text-sm text-slate-300">{course.description || "No description provided yet."}</p>

                <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
                  <span>{course.lesson_count} lessons</span>
                  <span>{course.enrollment_count} learners</span>
                  {course.mentor_name ? <span>Mentor: {course.mentor_name}</span> : null}
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Progress</span>
                      <span>{course.progress_percent}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full rounded-full bg-cyan-400" style={{ width: `${course.progress_percent}%` }} />
                    </div>
                  </div>
                  <button type="button" className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 hover:border-cyan-500/60">
                    {course.enrolled ? "Continue" : "Enroll"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-400">No published courses are available yet.</p>
        )}
      </div>
    </DashboardShell>
  );
}
