import { DashboardShell } from "@/components/dashboard-shell";
import { requireRole } from "@/lib/auth";

export default async function AdminDashboardPage() {
  await requireRole("ADMIN");

  return (
    <DashboardShell role="ADMIN" title="Admin overview" subtitle="Platform performance, registrations, and learner health.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total students", "1,284"],
          ["Active students", "842"],
          ["Total mentors", "38"],
          ["Courses", "64"]
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-4 text-3xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h3 className="text-lg font-semibold text-white">Recent registrations</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li className="flex justify-between border-b border-slate-800 pb-2"><span>Ritika S.</span><span>2 hours ago</span></li>
            <li className="flex justify-between border-b border-slate-800 pb-2"><span>Arjun M.</span><span>4 hours ago</span></li>
            <li className="flex justify-between border-b border-slate-800 pb-2"><span>Neha V.</span><span>6 hours ago</span></li>
            <li className="flex justify-between"><span>Aditya K.</span><span>Yesterday</span></li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h3 className="text-lg font-semibold text-white">Platform health</h3>
          <div className="mt-4 space-y-4 text-sm text-slate-300">
            <div>
              <div className="mb-1 flex justify-between"><span>Course completion rate</span><span>72%</span></div>
              <div className="h-2 rounded-full bg-slate-800"><div className="h-2 w-[72%] rounded-full bg-emerald-400" /></div>
            </div>
            <div>
              <div className="mb-1 flex justify-between"><span>Certificate issuance</span><span>88%</span></div>
              <div className="h-2 rounded-full bg-slate-800"><div className="h-2 w-[88%] rounded-full bg-cyan-400" /></div>
            </div>
            <div>
              <div className="mb-1 flex justify-between"><span>Referral conversion</span><span>41%</span></div>
              <div className="h-2 rounded-full bg-slate-800"><div className="h-2 w-[41%] rounded-full bg-violet-400" /></div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
