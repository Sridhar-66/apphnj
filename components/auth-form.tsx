"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, registerAction, resetPasswordAction } from "@/app/actions/auth";

type AuthState = {
  error?: string;
  success?: string;
};

const formClasses =
  "w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-50 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, {} as AuthState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-slate-200">
          Email
        </label>
        <input id="login-email" name="email" type="email" required className={formClasses} placeholder="you@example.com" />
      </div>

      <div>
        <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-slate-200">
          Password
        </label>
        <input id="login-password" name="password" type="password" required className={formClasses} placeholder="••••••••" />
      </div>

      {state?.error ? <p className="text-sm text-rose-400">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-emerald-400">{state.success}</p> : null}

      <button type="submit" disabled={isPending} className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60">
        {isPending ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-center text-sm text-slate-300">
        Need an account?{" "}
        <Link href="/register" className="font-medium text-cyan-400 hover:text-cyan-300">
          Create one
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, {} as AuthState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="register-full-name" className="mb-2 block text-sm font-medium text-slate-200">
          Full name
        </label>
        <input id="register-full-name" name="full_name" type="text" required className={formClasses} placeholder="Jane Doe" />
      </div>

      <div>
        <label htmlFor="register-email" className="mb-2 block text-sm font-medium text-slate-200">
          Email address
        </label>
        <input id="register-email" name="email" type="email" required className={formClasses} placeholder="you@example.com" />
      </div>

      <div>
        <label htmlFor="register-password" className="mb-2 block text-sm font-medium text-slate-200">
          Password
        </label>
        <input id="register-password" name="password" type="password" minLength={6} required className={formClasses} placeholder="At least 6 characters" />
      </div>

      {state?.error ? <p className="text-sm text-rose-400">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-emerald-400">{state.success}</p> : null}

      <button type="submit" disabled={isPending} className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60">
        {isPending ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-sm text-slate-300">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-cyan-400 hover:text-cyan-300">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, {} as AuthState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="reset-email" className="mb-2 block text-sm font-medium text-slate-200">
          Email address
        </label>
        <input id="reset-email" name="email" type="email" required className={formClasses} placeholder="you@example.com" />
      </div>

      {state?.error ? <p className="text-sm text-rose-400">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-emerald-400">{state.success}</p> : null}

      <button type="submit" disabled={isPending} className="w-full rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60">
        {isPending ? "Sending link..." : "Send reset link"}
      </button>

      <p className="text-center text-sm text-slate-300">
        <Link href="/login" className="font-medium text-cyan-400 hover:text-cyan-300">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
