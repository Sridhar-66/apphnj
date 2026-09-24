"use client";

import { useActionState } from "react";
import { createUserAction, type UserActionResult } from "@/app/actions/users";

const inputClasses =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-50 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40";

export function AdminUserForm() {
  const [state, formAction, isPending] = useActionState(createUserAction, {} as UserActionResult);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="managed-user-name" className="mb-2 block text-sm font-medium text-slate-200">Full name</label>
        <input id="managed-user-name" name="full_name" required className={inputClasses} />
      </div>
      <div>
        <label htmlFor="managed-user-email" className="mb-2 block text-sm font-medium text-slate-200">Email</label>
        <input id="managed-user-email" name="email" type="email" required className={inputClasses} />
      </div>
      <div>
        <label htmlFor="managed-user-password" className="mb-2 block text-sm font-medium text-slate-200">Temporary password</label>
        <input id="managed-user-password" name="password" type="password" minLength={6} required className={inputClasses} />
      </div>
      <div>
        <label htmlFor="managed-user-role" className="mb-2 block text-sm font-medium text-slate-200">Role</label>
        <select id="managed-user-role" name="role" defaultValue="CHILD" className={inputClasses}>
          <option value="CHILD">Student</option>
          <option value="MENTOR">Mentor</option>
          <option value="INFLUENCER">Influencer</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      {state?.error ? <p className="text-sm text-rose-400">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-emerald-400">{state.success}</p> : null}
      <button type="submit" disabled={isPending} className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60">
        {isPending ? "Creating user..." : "Create user"}
      </button>
    </form>
  );
}
