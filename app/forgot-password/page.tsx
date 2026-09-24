import { ForgotPasswordForm } from "@/components/auth-form";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Hirely & Jobly</p>
          <h1 className="mt-3 text-3xl font-bold text-white">Reset password</h1>
          <p className="mt-2 text-sm text-slate-300">We will send a reset link to your email.</p>
        </div>

        <ForgotPasswordForm />
      </div>
    </main>
  );
}
