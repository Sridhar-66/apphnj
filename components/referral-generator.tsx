"use client";

import { useState, useActionState } from "react";
import { createReferralAction, type ReferralActionResult } from "@/app/actions/referrals";

export function ReferralGenerator({
  defaultCode,
  appUrl
}: {
  defaultCode: string;
  appUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const [state, formAction, isPending] = useActionState(createReferralAction, {} as ReferralActionResult);

  const activeCode = state.referralCode || defaultCode;
  const referralLink = `${appUrl}/register?ref=${activeCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h3 className="text-lg font-semibold text-white">Your Shareable Referral Link</h3>
        <p className="mt-1 text-sm text-slate-400">
          Share this link with potential students. When they create an account and enroll, conversions and earnings will appear on your dashboard.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1 overflow-hidden rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-sm text-cyan-300">
            {referralLink}
          </div>
          <button
            type="button"
            onClick={copyToClipboard}
            className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            {copied ? "Copied! ✓" : "Copy Link"}
          </button>
        </div>
      </div>

      <form action={formAction} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h3 className="text-lg font-semibold text-white">Create Custom Campaign Code</h3>
        <p className="mt-1 text-sm text-slate-400">
          Create customized codes for specific campaigns or social channels (e.g. YOUTUBE2026, INSTA-DEAL).
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            name="referral_code"
            type="text"
            placeholder="e.g. SUMMER26"
            className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white uppercase placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-100 hover:border-cyan-500/60 hover:text-cyan-300 disabled:opacity-60"
          >
            {isPending ? "Creating..." : "Create Campaign Code"}
          </button>
        </div>

        {state?.error ? <p className="mt-3 text-sm text-rose-400">{state.error}</p> : null}
        {state?.success ? <p className="mt-3 text-sm text-emerald-400">{state.success}</p> : null}
      </form>
    </div>
  );
}
