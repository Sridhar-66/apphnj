"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { markLessonCompleteAction, markLessonIncompleteAction } from "@/app/actions/progress";

export function LessonCompleteButton({
  courseId,
  lessonId,
  isCompleted,
  nextLessonId
}: {
  courseId: string;
  lessonId: string;
  isCompleted: boolean;
  nextLessonId?: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [completed, setCompleted] = useState(isCompleted);
  const [banner, setBanner] = useState<string | null>(null);
  const router = useRouter();

  const handleToggle = () => {
    startTransition(async () => {
      if (!completed) {
        const res = await markLessonCompleteAction(courseId, lessonId);
        if (res.success) {
          setCompleted(true);
          setBanner(res.success);
          if (nextLessonId) {
            setTimeout(() => {
              router.push(`/student/courses/${courseId}/lessons/${nextLessonId}`);
            }, 1200);
          } else {
            router.refresh();
          }
        }
      } else {
        const res = await markLessonIncompleteAction(courseId, lessonId);
        if (res.success) {
          setCompleted(false);
          setBanner(null);
          router.refresh();
        }
      }
    });
  };

  return (
    <div className="space-y-3">
      {banner ? (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          {banner}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
            completed
              ? "border border-emerald-500/50 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
              : "border border-cyan-500/50 bg-cyan-500 text-slate-950 hover:bg-cyan-400"
          }`}
        >
          {isPending
            ? "Updating..."
            : completed
            ? "✓ Completed (Click to undo)"
            : "Mark Lesson Complete"}
        </button>

        {nextLessonId ? (
          <button
            type="button"
            onClick={() => router.push(`/student/courses/${courseId}/lessons/${nextLessonId}`)}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:text-white"
          >
            Next Lesson →
          </button>
        ) : (
          <button
            type="button"
            onClick={() => router.push(`/student/courses/${courseId}`)}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:text-white"
          >
            Back to Course Overview
          </button>
        )}
      </div>
    </div>
  );
}
