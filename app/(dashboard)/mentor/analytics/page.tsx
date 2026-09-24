import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireRole } from "@/lib/auth";
import { getMentorDashboardData } from "@/lib/dashboard-data";
import { getMentorCourseList } from "@/lib/course-data";

export const dynamic = "force-dynamic";

export default async function MentorAnalyticsPage() {
  const session = await requireRole("MENTOR");
  const [data, courses] = await Promise.all([
    getMentorDashboardData(session.id),
    getMentorCourseList(session.id)
  ]);

  return (
    <DashboardShell role="MENTOR" title="Learner Analytics" subtitle={`Performance reports for ${session.full_name}.`}>
      <div className="space-y-6">
        {/* KPI Metrics */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Total Courses", data.courseCount],
            ["Total Enrollments", data.enrollments],
            ["Active Learners", data.activeLearners],
            ["Avg Completion Rate", `${data.completionRate}%`]
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-4 text-3xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Course-by-course Analytics Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Course Performance Breakdown</h3>
            <Link href="/mentor/courses" className="text-sm text-cyan-300 hover:text-cyan-200">
              Manage Courses
            </Link>
          </div>

          {courses.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400">
                    <th className="py-3 px-4">Course Title</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Lessons</th>
                    <th className="py-3 px-4">Enrolled Students</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {courses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-medium text-white">{c.title}</td>
                      <td className="py-3 px-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
                          c.status === "published"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{c.lesson_count}</td>
                      <td className="py-3 px-4 text-slate-300">{c.enrollment_count}</td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/mentor/courses/${c.id}`}
                          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 transition hover:border-cyan-500/50 hover:text-cyan-300"
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">No courses created yet.</p>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
