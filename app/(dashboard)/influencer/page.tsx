import { DashboardShell } from "@/components/dashboard-shell";
import { ReferralGenerator } from "@/components/referral-generator";
import { requireRole } from "@/lib/auth";
import { getInfluencerDashboardData } from "@/lib/referral-data";

export const dynamic = "force-dynamic";

export default async function InfluencerDashboardPage() {
  const session = await requireRole("INFLUENCER");
  const data = await getInfluencerDashboardData(session.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://apphnj.vercel.app";

  return (
    <DashboardShell role="INFLUENCER" title="Influencer Dashboard" subtitle={`Signed in as ${session.full_name}.`}>
      <div className="space-y-6">
        {/* KPI Metrics */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Total Referrals", data.totalReferrals],
            ["Registered Students", data.registeredStudents],
            ["Conversions", data.conversions],
            ["Estimated Earnings", `$${data.totalEarnings.toFixed(2)}`]
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-4 text-3xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Shareable Link & Code Generator */}
        <ReferralGenerator defaultCode={data.referralCode} appUrl={appUrl} />

        {/* Referrals & Conversions Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Referral Activity & Conversions</h3>
            <span className="text-xs text-slate-400">{data.referralsList.length} records</span>
          </div>

          {data.referralsList.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400">
                    <th className="py-3 px-4">Campaign Code</th>
                    <th className="py-3 px-4">Referred Student</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Commission</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.referralsList.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-mono font-medium text-cyan-300">{r.referral_code}</td>
                      <td className="py-3 px-4 text-slate-200">{r.student_name || "Pending registration"}</td>
                      <td className="py-3 px-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
                          r.status === "converted" || r.status === "paid"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-400"
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        ${(r.amount_cents / 100).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">
              No referral activity yet. Share your referral link with students to start earning commissions.
            </p>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
