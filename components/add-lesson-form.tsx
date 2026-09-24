"use client";

import { useActionState, useRef } from "react";
import { createLessonAction, type LessonActionResult } from "@/app/actions/lessons";

const formClasses =
  "w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-50 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40";

export function AddLessonForm({ courseId }: { courseId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(async (prev: LessonActionResult | undefined, formData: FormData) => {
    const res = await createLessonAction(prev, formData);
    if (res.success && formRef.current) {
      formRef.current.reset();
    }
    return res;
  }, {} as LessonActionResult);

  return (
    <form ref={formRef} action={formAction} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Curriculum</p>
        <h4 className="mt-1 text-lg font-semibold text-white">Add New Lesson</h4>
      </div>

      <input type="hidden" name="course_id" value={courseId} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="lesson-title" className="mb-2 block text-sm font-medium text-slate-200">
            Lesson Title *
          </label>
          <input
            id="lesson-title"
            name="title"
            type="text"
            required
            className={formClasses}
            placeholder="e.g. Introduction to Next.js App Router"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="lesson-desc" className="mb-2 block text-sm font-medium text-slate-200">
            Lesson Description
          </label>
          <textarea
            id="lesson-desc"
            name="description"
            rows={2}
            className={formClasses}
            placeholder="Brief overview of what students will learn in this lesson..."
          />
        </div>

        <div>
          <label htmlFor="lesson-yt" className="mb-2 block text-sm font-medium text-slate-200">
            YouTube Video URL
          </label>
          <input
            id="lesson-yt"
            name="youtube_url"
            type="url"
            className={formClasses}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="lesson-duration" className="mb-2 block text-sm font-medium text-slate-200">
              Duration (mins)
            </label>
            <input
              id="lesson-duration"
              name="duration_minutes"
              type="number"
              min={0}
              defaultValue={15}
              className={formClasses}
            />
          </div>

          <div>
            <label htmlFor="lesson-order" className="mb-2 block text-sm font-medium text-slate-200">
              Sort Order
            </label>
            <input
              id="lesson-order"
              name="sort_order"
              type="number"
              min={0}
              defaultValue={0}
              className={formClasses}
            />
          </div>
        </div>
      </div>

      {state?.error ? <p className="text-sm text-rose-400">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-emerald-400">{state.success}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
      >
        {isPending ? "Adding Lesson..." : "Add Lesson"}
      </button>
    </form>
  );
}
