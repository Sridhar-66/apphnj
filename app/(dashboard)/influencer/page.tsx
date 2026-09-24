import { DashboardShell } from "@/components/dashboard-shell";
import { requireRole } from "@/lib/auth";

export default async function InfluencerDashboardPage() {
  await requireRole("INFLUENCER");

  return (
    <DashboardShell role="INFLUENCER" title="Influencer dashboard" subtitle="Track referral performance, conversions, and partner growth.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total referrals", "489"],
          ["Registered students", "192"],
          ["Conversions", "81"],
          ["Conversion rate", "42%"]
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-4 text-3xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h3 className="text-lg font-semibold text-white">Recent referrals</h3>
        <ul className="mt-4 space-y-3 text-sm text-slate-300">
          <li className="flex justify-between border-b border-slate-800 pb-2"><span>Aditi P.</span><span>Registered</span></li>
          <li className="flex justify-between border-b border-slate-800 pb-2"><span>Sameer R.</span><span>Converted</span></li>
          <li className="flex justify-between"><span>Riya N.</span><span>Pending</span></li>
        </ul>
      </div>
    </DashboardShell>
  );
}
