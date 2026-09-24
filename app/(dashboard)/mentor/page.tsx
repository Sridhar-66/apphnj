import { DashboardShell } from "@/components/dashboard-shell";
import { requireRole } from "@/lib/auth";

export default async function MentorDashboardPage() {
  await requireRole("MENTOR");

  return (
    <DashboardShell role="MENTOR" title="Mentor dashboard" subtitle="Track enrollments, learner progress, and course momentum.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Students", "148"],
          ["Enrollments", "312"],
          ["Active learners", "96"],
          ["Completion rate", "71%"]
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-4 text-3xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h3 className="text-lg font-semibold text-white">Course performance</h3>
        <ul className="mt-4 space-y-3 text-sm text-slate-300">
          <li className="flex justify-between border-b border-slate-800 pb-2"><span>Career Skills Bootcamp</span><span>86% completion</span></li>
          <li className="flex justify-between border-b border-slate-800 pb-2"><span>Product Design Foundations</span><span>74% completion</span></li>
          <li className="flex justify-between"><span>AI for Beginners</span><span>68% completion</span></li>
        </ul>
      </div>
    </DashboardShell>
  );
}
