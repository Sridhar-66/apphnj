import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireRole } from "@/lib/auth";
import { getStudentCertificates } from "@/lib/course-data";

export default async function StudentCertificatesPage() {
  const session = await requireRole("CHILD");
  const certificates = await getStudentCertificates(session.id);

  return (
    <DashboardShell role="CHILD" title="Earned Certificates" subtitle={`Certificates awarded to ${session.full_name}.`}>
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">Your Credentials & Achievements</h3>
            <Link href="/student/courses" className="text-sm text-cyan-300 hover:text-cyan-200">
              Browse Courses
            </Link>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Certificates are automatically issued when you complete 100% of all lessons in an enrolled course.
          </p>
        </div>

        {certificates.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 shadow-2xl"
              >
                {/* Certificate Decorative Border */}
                <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-emerald-500/10 blur-2xl" />

                <div className="flex items-start justify-between">
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                    Verified Certificate
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {new Date(cert.issued_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                </div>

                <div className="my-6 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Certificate of Completion</p>
                  <p className="mt-2 text-sm text-slate-300">This certifies that</p>
                  <h4 className="mt-1 text-2xl font-bold text-white">{cert.student_name}</h4>
                  <p className="mt-2 text-sm text-slate-300">has successfully completed all requirements for</p>
                  <h5 className="mt-1 text-lg font-semibold text-cyan-300">{cert.course_title}</h5>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs">
                  <div>
                    <p className="text-slate-500">Certificate ID</p>
                    <p className="font-mono text-slate-300">{cert.certificate_code}</p>
                  </div>
                  <Link
                    href={`/student/courses/${cert.course_id}`}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-200 hover:border-emerald-500/50 hover:text-emerald-300"
                  >
                    Review Course →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-xl">
              🎓
            </div>
            <h4 className="text-base font-semibold text-white">No certificates earned yet</h4>
            <p className="mt-1 text-sm text-slate-400">
              Enroll in a learning path, complete all lessons, and your certified completion badge will appear here.
            </p>
            <Link
              href="/student/courses"
              className="mt-4 inline-flex rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
            >
              Start Learning
            </Link>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
