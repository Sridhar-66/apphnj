import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireRole } from "@/lib/auth";
import { getStudentDashboardData } from "@/lib/dashboard-data";
import { getStudentCourseList, getStudentCertificates } from "@/lib/course-data";

export default async function StudentDashboardPage() {
  const session = await requireRole("CHILD");
  const [data, courses, certificates] = await Promise.all([
    getStudentDashboardData(session.id),
    getStudentCourseList(session.id),
    getStudentCertificates(session.id)
  ]);

  const enrolledCourses = courses.filter((c) => c.enrolled);

  return (
    <DashboardShell role="CHILD" title="Student Dashboard" subtitle={`Welcome back, ${session.full_name}.`}>
      <div className="space-y-6">
        {/* KPI Metric Cards */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Enrolled Courses", data.enrolledCourses],
            ["Lessons Completed", data.completedLessons],
            ["Overall Completion", `${data.completion}%`],
            ["Earned Certificates", data.certificates]
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-4 text-3xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Continue Learning Section */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">Your Courses</h3>
            <Link href="/student/courses" className="text-sm text-cyan-300 hover:text-cyan-200">
              Browse All Courses →
            </Link>
          </div>

          {enrolledCourses.length ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-cyan-300">{course.status}</span>
                      <h4 className="mt-1 font-semibold text-white">{course.title}</h4>
                    </div>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                      {course.lesson_count} lessons
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">{course.description || "No description provided."}</p>

                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Progress</span>
                      <span className="font-medium text-cyan-300">{course.progress_percent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full rounded-full bg-cyan-400" style={{ width: `${course.progress_percent}%` }} />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/student/courses/${course.id}`}
                      className="block w-full rounded-xl border border-cyan-500/40 bg-cyan-950/40 py-2 text-center text-xs font-semibold text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400"
                    >
                      Continue Course →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-800 p-6 text-center">
              <p className="text-sm text-slate-400">You have not enrolled in any courses yet.</p>
              <Link
                href="/student/courses"
                className="mt-3 inline-flex rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
              >
                Explore Courses
              </Link>
            </div>
          )}
        </div>

        {/* Certificates Quick Link if available */}
        {certificates.length > 0 ? (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                  Credentials Earned
                </span>
                <h4 className="mt-2 text-lg font-bold text-white">
                  You have {certificates.length} verified certificate{certificates.length > 1 ? "s" : ""}!
                </h4>
              </div>
              <Link
                href="/student/certificates"
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
              >
                View Certificates →
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardShell>
  );
}
