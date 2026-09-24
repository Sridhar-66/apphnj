import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireRole } from "@/lib/auth";
import { getMentorDashboardData } from "@/lib/dashboard-data";

export default async function MentorDashboardPage() {
  const session = await requireRole("MENTOR");
  const data = await getMentorDashboardData(session.id);

  return (
    <DashboardShell role="MENTOR" title="Mentor dashboard" subtitle={`Signed in as ${session.full_name}.`}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Courses", data.courseCount],
          ["Enrollments", data.enrollments],
          ["Active learners", data.activeLearners],
          ["Completion rate", `${data.completionRate}%`]
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-4 text-3xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">Course performance</h3>
          <Link href="/mentor/courses" className="text-sm text-cyan-300 hover:text-cyan-200">Manage courses</Link>
        </div>
        <p className="mt-4 text-sm text-slate-400">Course analytics update from live enrollment and completion records in the database.</p>
      </div>
    </DashboardShell>
  );
}
