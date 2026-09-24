import { DashboardShell } from "@/components/dashboard-shell";
import { requireRole } from "@/lib/auth";

export default async function StudentDashboardPage() {
  await requireRole("CHILD");

  return (
    <DashboardShell role="CHILD" title="Student dashboard" subtitle="Your learning path, current enrollments, and course progress.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Enrolled courses", "4"],
          ["Lessons completed", "42"],
          ["Completion", "68%"],
          ["Certificates", "2"]
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-4 text-3xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h3 className="text-lg font-semibold text-white">Continue learning</h3>
        <ul className="mt-4 space-y-3 text-sm text-slate-300">
          <li className="flex justify-between border-b border-slate-800 pb-2"><span>Frontend Fundamentals</span><span>Resume lesson</span></li>
          <li className="flex justify-between border-b border-slate-800 pb-2"><span>Career Readiness</span><span>Module 3</span></li>
          <li className="flex justify-between"><span>AI Productivity</span><span>Lesson 9</span></li>
        </ul>
      </div>
    </DashboardShell>
  );
}
