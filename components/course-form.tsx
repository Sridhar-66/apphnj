"use client";

import { useActionState, useRef } from "react";
import { createCourseAction, type CourseActionResult } from "@/app/actions/courses";

const initialState: CourseActionResult = {};

export function CourseForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(async (prev: CourseActionResult | undefined, formData: FormData) => {
    const res = await createCourseAction(prev, formData);
    if (res.success && formRef.current) {
      formRef.current.reset();
    }
    return res;
  }, initialState);

  return (
    <form ref={formRef} action={formAction} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Create a course</h3>
        <p className="mt-1 text-sm text-slate-400">Add a new course draft or publish it right away.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-300 md:col-span-2">
          <span className="mb-1 block">Course title *</span>
          <input
            name="title"
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none ring-0 transition focus:border-cyan-500"
            placeholder="e.g. Intro to Career Readiness"
          />
        </label>

        <label className="block text-sm text-slate-300 md:col-span-2">
          <span className="mb-1 block">Description</span>
          <textarea
            name="description"
            rows={4}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none transition focus:border-cyan-500"
            placeholder="Describe what learners will gain from this course."
          />
        </label>

        <label className="block text-sm text-slate-300">
          <span className="mb-1 block">Status</span>
          <select
            name="status"
            defaultValue="draft"
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none transition focus:border-cyan-500"
          >
            <option value="draft">Draft (Private)</option>
            <option value="published">Published (Visible to students)</option>
          </select>
        </label>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Creating course..." : "Create course"}
        </button>

        {state?.error ? <p className="text-sm text-rose-300">{state.error}</p> : null}
        {state?.success ? <p className="text-sm text-emerald-300">{state.success}</p> : null}
      </div>
    </form>
  );
}
