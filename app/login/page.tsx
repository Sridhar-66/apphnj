import Link from "next/link";
import { LoginForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Hirely & Jobly</p>
          <h1 className="mt-3 text-3xl font-bold text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-300">Sign in to your learning dashboard.</p>
        </div>

        <LoginForm />

        <div className="mt-6 text-center text-sm">
          <Link href="/forgot-password" className="text-slate-300 transition hover:text-cyan-300">
            Forgot password?
          </Link>
        </div>
      </div>
    </main>
  );
}
