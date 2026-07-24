"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  addCourseAction,
  deleteCourseAction,
  seedCoursesAction,
  updateCourseAction,
} from "@/app/actions/education";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

type Course = {
  id: string;
  title: string;
  subject: string;
  feeLabel: string | null;
  youtubeUrl: string | null;
  isActive: boolean;
};

export function CoursesEditorPanel({
  businessId,
  handle,
  courses: initial,
}: {
  businessId: string;
  handle: string;
  courses: Course[];
}) {
  const router = useRouter();
  const [courses, setCourses] = useState(initial);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("General");
  const [feeLabel, setFeeLabel] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mt-5 space-y-5">
      <Link
        href={`/${handle}/courses`}
        target="_blank"
        className="inline-block rounded-full bg-brand-mist px-3 py-1 text-xs font-semibold"
      >
        Public courses ↗
      </Link>

      {courses.length === 0 ? (
        <div className="premium-card px-4 py-6 text-center">
          <p className="text-sm font-semibold">No courses yet</p>
          <Button
            type="button"
            className="mt-4"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const r = await seedCoursesAction(businessId);
                setMessage(r.success ? (r.seeded ? "Starter courses loaded" : "Already has courses") : r.error ?? "Failed");
                router.refresh();
              })
            }
          >
            Load starter courses
          </Button>
        </div>
      ) : null}

      <form
        className="premium-card space-y-2 px-3 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const r = await addCourseAction({
              businessId,
              title,
              subject,
              feeLabel: feeLabel || undefined,
              youtubeUrl: youtubeUrl || undefined,
            });
            if (!r.success) {
              { const __e = r.error ?? "Failed"; setMessage(__e); toast.error(__e); }
              return;
            }
            setTitle("");
            setYoutubeUrl("");
            setMessage("Course added"); toast.success("Course added");
            router.refresh();
          });
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Add course</p>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Course title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="Subject / skill"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="Fee label"
            value={feeLabel}
            onChange={(e) => setFeeLabel(e.target.value)}
          />
        </div>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="YouTube URL only (optional)"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
        />
        <p className="text-[10px] text-brand-muted">
          YouTube only — no Vimeo, Drive, or .mp4 uploads.
        </p>
        <Button type="submit" disabled={isPending || !title.trim()}>
          Add course
        </Button>
      </form>

      {message ? <p className="text-sm">{message}</p> : null}

      <ul className="space-y-2">
        {courses.map((c) => (
          <li key={c.id} className="premium-card px-3 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">
                  {c.title}
                  {!c.isActive ? (
                    <span className="ml-2 text-[10px] uppercase text-slate-400">Hidden</span>
                  ) : null}
                </p>
                <p className="text-[11px] text-brand-muted">
                  {c.subject} · {c.feeLabel || "—"}
                  {c.youtubeUrl ? " · YouTube" : ""}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  className="text-[11px] font-semibold text-brand-turquoise"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      await updateCourseAction({
                        businessId,
                        courseId: c.id,
                        isActive: !c.isActive,
                      });
                      setCourses((xs) =>
                        xs.map((x) => (x.id === c.id ? { ...x, isActive: !x.isActive } : x)),
                      );
                    })
                  }
                >
                  {c.isActive ? "Hide" : "Show"}
                </button>
                <button
                  type="button"
                  className="text-[11px] font-semibold text-red-600"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      await deleteCourseAction(businessId, c.id);
                      setCourses((xs) => xs.filter((x) => x.id !== c.id));
                    })
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
