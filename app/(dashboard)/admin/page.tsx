import { DashboardShell } from "@/components/dashboard-shell";
import { getAdminDashboardData } from "@/lib/dashboard-data";
import { requireRole } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const session = await requireRole("ADMIN");
  const data = await getAdminDashboardData();

  return (
    <DashboardShell role="ADMIN" title="Admin overview" subtitle={`Signed in as ${session.full_name}.`}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Students", data.students],
          ["Mentors", data.mentors],
          ["Influencers", data.influencers]
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-4 text-3xl font-bold text-white">{value}</p>
          </div>
        ))}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-sm text-slate-400">Courses</p>
          <p className="mt-4 text-lg font-semibold text-slate-300">Not available yet</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h3 className="text-lg font-semibold text-white">Recent registrations</h3>
          {data.recentProfiles.length ? (
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {data.recentProfiles.map((profile) => (
                <li key={profile.id} className="flex justify-between gap-4 border-b border-slate-800 pb-2 last:border-0">
                  <span>{profile.full_name || profile.email}</span>
                  <span className="text-right text-slate-400">{profile.role}</span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-4 text-sm text-slate-400">No registrations yet.</p>}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h3 className="text-lg font-semibold text-white">Platform health</h3>
          <p className="mt-4 text-sm text-slate-400">Analytics will appear after course, progress, and referral records are added.</p>
        </div>
      </div>
    </DashboardShell>
  );
}
