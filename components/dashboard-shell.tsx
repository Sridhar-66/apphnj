import type { ReactNode } from "react";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import type { AppRole } from "@/lib/auth";

const navigationMap: Record<AppRole, { label: string; href: string }[]> = {
  ADMIN: [
    { label: "Overview", href: "/admin" },
    { label: "Users", href: "/admin/users" },
    { label: "Analytics", href: "/admin/analytics" },
    { label: "Settings", href: "/admin/settings" }
  ],
  MENTOR: [
    { label: "Overview", href: "/mentor" },
    { label: "Courses", href: "/mentor/courses" },
    { label: "Students", href: "/mentor/students" },
    { label: "Analytics", href: "/mentor/analytics" }
  ],
  CHILD: [
    { label: "Overview", href: "/student" },
    { label: "Courses", href: "/student/courses" },
    { label: "Progress", href: "/student/progress" },
    { label: "Certificates", href: "/student/certificates" }
  ],
  INFLUENCER: [
    { label: "Overview", href: "/influencer" },
    { label: "Referrals", href: "/influencer/referrals" },
    { label: "Analytics", href: "/influencer/analytics" },
    { label: "Profile", href: "/influencer/profile" }
  ]
};

export function DashboardShell({
  role,
  title,
  subtitle,
  children
}: {
  role: AppRole;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className="w-full border-b border-slate-800 bg-slate-900/80 p-5 lg:w-72 lg:border-b-0 lg:border-r">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Hirely & Jobly</p>
              <h1 className="mt-2 text-xl font-semibold">{role}</h1>
            </div>
          </div>

          <nav className="space-y-2">
            {navigationMap[role].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-500/60 hover:text-cyan-300"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form action={logoutAction} className="mt-10">
            <button type="submit" className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-rose-500/60 hover:text-rose-300">
              Logout
            </button>
          </form>
        </aside>

        <main className="flex-1 p-5 md:p-8">
          <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/40">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Dashboard</p>
            <h2 className="mt-3 text-3xl font-bold text-white">{title}</h2>
            <p className="mt-2 text-sm text-slate-300">{subtitle}</p>
          </div>

          <div className="space-y-5">{children}</div>
        </main>
      </div>
    </div>
  );
}
