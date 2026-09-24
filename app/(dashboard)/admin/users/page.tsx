import { DashboardShell } from "@/components/dashboard-shell";
import { AdminUserForm } from "@/components/admin-user-form";
import { requireRole } from "@/lib/auth";

export default async function AdminUsersPage() {
  const session = await requireRole("ADMIN");

  return (
    <DashboardShell role="ADMIN" title="User management" subtitle={`Signed in as ${session.full_name}.`}>
      <div className="max-w-xl rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h3 className="text-lg font-semibold text-white">Create a user</h3>
        <p className="mt-2 text-sm text-slate-400">New accounts are created in Supabase and assigned a role server-side.</p>
        <div className="mt-5">
          <AdminUserForm />
        </div>
      </div>
    </DashboardShell>
  );
}
