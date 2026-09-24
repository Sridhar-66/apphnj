import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireRole } from "@/lib/auth";
import { getAdminCourseList } from "@/lib/course-data";

export default async function AdminCoursesPage() {
  const session = await requireRole("ADMIN");
  const courses = await getAdminCourseList();

  return (
    <DashboardShell role="ADMIN" title="Course overview" subtitle={`Signed in as ${session.full_name}.`}>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">Platform courses</h3>
          <Link href="/admin" className="text-sm text-cyan-300 hover:text-cyan-200">Back to dashboard</Link>
        </div>

        {courses.length ? (
          <div className="mt-5 space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">{course.status}</p>
                    <h4 className="mt-2 text-xl font-semibold text-white">{course.title}</h4>
                  </div>
                  <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">{course.lesson_count} lessons</span>
                </div>

                <p className="mt-3 text-sm text-slate-300">{course.description || "No description provided yet."}</p>

                <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
                  <span>{course.enrollment_count} enrollments</span>
                  <span>{course.mentor_name ? `Mentor: ${course.mentor_name}` : "Mentor: unassigned"}</span>
                  <span>{course.slug}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-400">No courses have been created yet.</p>
        )}
      </div>
    </DashboardShell>
  );
}
