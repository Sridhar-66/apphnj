"use client";

import { useActionState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createMaterialAction, type MaterialActionResult } from "@/app/actions/materials";

const formClasses =
  "w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-50 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40";

export function AddMaterialForm({
  lessonId,
  courseId
}: {
  lessonId: string;
  courseId: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(async (prev: MaterialActionResult | undefined, formData: FormData) => {
    const res = await createMaterialAction(prev, formData);
    if (res.success && formRef.current) {
      formRef.current.reset();
    }
    return res;
  }, {} as MaterialActionResult);

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state?.success, router]);

  return (
    <form ref={formRef} action={formAction} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
      <h5 className="text-sm font-semibold text-slate-200">Attach Resource / Material</h5>

      <input type="hidden" name="lesson_id" value={lessonId} />
      <input type="hidden" name="course_id" value={courseId} />

      <div className="grid gap-3 md:grid-cols-3">
        <div className="md:col-span-1">
          <label htmlFor={`material-title-${lessonId}`} className="mb-1 block text-xs font-medium text-slate-300">
            Material Title *
          </label>
          <input
            id={`material-title-${lessonId}`}
            name="title"
            type="text"
            required
            className={formClasses}
            placeholder="e.g. Slide Deck / PDF"
          />
        </div>

        <div>
          <label htmlFor={`material-kind-${lessonId}`} className="mb-1 block text-xs font-medium text-slate-300">
            Type
          </label>
          <select id={`material-kind-${lessonId}`} name="kind" defaultValue="pdf" className={formClasses}>
            <option value="pdf">PDF Document</option>
            <option value="link">External Link</option>
            <option value="article">Article / Reading</option>
            <option value="video">Additional Video</option>
          </select>
        </div>

        <div>
          <label htmlFor={`material-url-${lessonId}`} className="mb-1 block text-xs font-medium text-slate-300">
            URL / Link *
          </label>
          <input
            id={`material-url-${lessonId}`}
            name="file_url"
            type="url"
            required
            className={formClasses}
            placeholder="https://..."
          />
        </div>
      </div>

      {state?.error ? <p className="text-xs text-rose-400">{state.error}</p> : null}
      {state?.success ? <p className="text-xs text-emerald-400">{state.success}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-100 hover:border-cyan-500/50 hover:text-cyan-300 disabled:opacity-60"
      >
        {isPending ? "Attaching..." : "+ Attach Material"}
      </button>
    </form>
  );
}
