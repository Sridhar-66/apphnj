import { DashboardShell } from "@/components/dashboard-shell";
import { requireRole } from "@/lib/auth";

export default async function MentorDashboardPage() {
  const session = await requireRole("MENTOR");

  return (
    <DashboardShell role="MENTOR" title="Mentor dashboard" subtitle={`Signed in as ${session.full_name}.`}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Registered learners", "Not tracked"],
          ["Enrollments", "Not tracked"],
          ["Active learners", "Not tracked"],
          ["Completion rate", "Not tracked"]
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-4 text-3xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h3 className="text-lg font-semibold text-white">Course performance</h3>
        <p className="mt-4 text-sm text-slate-400">No courses have been created yet.</p>
      </div>
    </DashboardShell>
  );
}
