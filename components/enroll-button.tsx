"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { enrollCourseAction } from "@/app/actions/enrollments";

export function EnrollButton({
  courseId,
  isEnrolled,
  disabled
}: {
  courseId: string;
  isEnrolled: boolean;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (isEnrolled) {
    return (
      <button
        type="button"
        onClick={() => router.push(`/student/courses/${courseId}`)}
        className="rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/30"
      >
        Continue Learning →
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending || disabled}
      onClick={() => {
        startTransition(async () => {
          const res = await enrollCourseAction(courseId);
          if (res.success) {
            router.push(`/student/courses/${courseId}`);
          }
        });
      }}
      className="rounded-xl border border-cyan-500/50 bg-cyan-500/20 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/30 hover:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "Enrolling..." : "Enroll Now"}
    </button>
  );
}
