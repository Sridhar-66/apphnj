"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const inputClasses =
  "w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-50 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(undefined);
    setSuccess(undefined);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setIsPending(true);
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsPending(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess("Password updated. You can sign in with your new password.");
    globalThis.setTimeout(() => router.push("/login"), 1200);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-slate-200">New password</label>
        <input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required className={inputClasses} />
      </div>
      <div>
        <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-slate-200">Confirm password</label>
        <input id="confirm-password" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={6} required className={inputClasses} />
      </div>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-400">{success}</p> : null}
      <button type="submit" disabled={isPending} className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60">
        {isPending ? "Updating password..." : "Update password"}
      </button>
    </form>
  );
}
