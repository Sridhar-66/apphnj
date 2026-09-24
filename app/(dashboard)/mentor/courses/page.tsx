import { DashboardShell } from "@/components/dashboard-shell";
import { CourseForm } from "@/components/course-form";
import { requireRole } from "@/lib/auth";
import { getMentorCourseList } from "@/lib/course-data";

export default async function MentorCoursesPage() {
  const session = await requireRole("MENTOR");
  const courses = await getMentorCourseList(session.id);

  return (
    <DashboardShell role="MENTOR" title="Course management" subtitle={`Signed in as ${session.full_name}.`}>
      <CourseForm />

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h3 className="text-lg font-semibold text-white">Your courses</h3>

        {courses.length ? (
          <div className="mt-5 space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">{course.status}</p>
                    <h4 className="mt-2 text-xl font-semibold text-white">{course.title}</h4>
                  </div>
                  <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">{course.lesson_count} lessons</span>
                </div>
                <p className="mt-3 text-sm text-slate-300">{course.description || "No description provided yet."}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
                  <span>{course.enrollment_count} enrollments</span>
                  <span>{course.slug}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-400">You have not created any courses yet.</p>
        )}
      </div>
    </DashboardShell>
  );
}
