"use client";

import { useMemo, useState, useTransition } from "react";
import { submitCourseEnquiryAction } from "@/app/actions/education";
import { YoutubeEmbed } from "@/components/tenant/youtube-embed";
import { whatsappUrl } from "@/core/utils/business-profile";

export type CoursePublic = {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  feeLabel: string | null;
  youtubeUrl: string | null;
  youtubeVideoId: string | null;
};

export function CoursesCatalog({
  handle,
  businessName,
  courses,
  whatsapp,
}: {
  handle: string;
  businessName: string;
  courses: CoursePublic[];
  whatsapp?: string;
}) {
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [enquiryCourse, setEnquiryCourse] = useState<CoursePublic | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const subjects = useMemo(
    () => Array.from(new Set(courses.map((c) => c.subject))).sort(),
    [courses],
  );
  const filtered =
    subjectFilter === "all" ? courses : courses.filter((c) => c.subject === subjectFilter);

  if (!courses.length) {
    return (
      <div className="t-card px-4 py-10 text-center">
        <p className="t-ink text-sm font-semibold">Courses coming soon</p>
        <p className="t-muted mt-1 text-xs">Message us for the current batch list.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="t-slot-chip"
          data-selected={subjectFilter === "all" ? "true" : "false"}
          onClick={() => setSubjectFilter("all")}
        >
          All
        </button>
        {subjects.map((s) => (
          <button
            key={s}
            type="button"
            className="t-slot-chip"
            data-selected={subjectFilter === s ? "true" : "false"}
            onClick={() => setSubjectFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {filtered.map((c) => {
          const waMsg = `Hi ${businessName}! Enquiry about: ${c.title} (${c.subject})`;
          const waHref = whatsapp
            ? whatsappUrl(whatsapp, waMsg)
            : `https://wa.me/?text=${encodeURIComponent(waMsg)}`;
          return (
            <article key={c.id} className="t-card space-y-3 p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="t-muted text-[10px] font-bold uppercase tracking-wider">{c.subject}</p>
                  <h2 className="t-ink mt-0.5 text-sm font-bold">{c.title}</h2>
                  {c.description ? (
                    <p className="t-muted mt-1 text-xs leading-relaxed">{c.description}</p>
                  ) : null}
                </div>
                <p
                  className="shrink-0 text-xs font-bold"
                  style={{ color: "var(--t-primary-text, var(--t-primary))" }}
                >
                  {c.feeLabel || "Enquire"}
                </p>
              </div>
              {c.youtubeUrl || c.youtubeVideoId ? (
                <YoutubeEmbed
                  url={c.youtubeUrl || c.youtubeVideoId || ""}
                  title={c.title}
                />
              ) : null}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="t-btn-primary !min-h-9 !w-auto !px-4 text-xs"
                  onClick={() => {
                    setEnquiryCourse(c);
                    setStatus(null);
                  }}
                >
                  Free enquiry
                </button>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full bg-[#25D366] px-4 py-2 text-xs font-bold text-white"
                >
                  WhatsApp
                </a>
              </div>
            </article>
          );
        })}
      </div>

      {enquiryCourse ? (
        <div className="t-card mt-5 space-y-3 p-4">
          <p className="text-sm font-bold">Enquiry: {enquiryCourse.title}</p>
          <p className="t-muted text-[11px]">
            Free enquiry — goes to the institute&apos;s sheet. No payment on ALINKS.
          </p>
          <input
            className="t-input"
            placeholder="Student / parent name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="t-input"
            placeholder="10-digit phone"
            inputMode="numeric"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          />
          <textarea
            className="t-input min-h-[72px]"
            placeholder="Message (batch, demo, grade…)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="t-btn-primary"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const r = await submitCourseEnquiryAction({
                    handle,
                    courseId: enquiryCourse.id,
                    courseTitle: enquiryCourse.title,
                    name,
                    phone,
                    message,
                  });
                  if (!r.success) {
                    setStatus(r.error ?? "Failed");
                    return;
                  }
                  setStatus("Enquiry sent. They will contact you.");
                  setName("");
                  setPhone("");
                  setMessage("");
                  setEnquiryCourse(null);
                })
              }
            >
              Submit enquiry
            </button>
            <button type="button" className="text-xs font-semibold" onClick={() => setEnquiryCourse(null)}>
              Cancel
            </button>
          </div>
          {status ? <p className="text-xs font-medium">{status}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
