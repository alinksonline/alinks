"use client";

import { useRef, useState, useTransition } from "react";
import { cn } from "@/core/utils/cn";

type MediaResult = {
  success: boolean;
  url?: string;
  width?: number;
  height?: number;
  bytes?: number;
  error?: string;
  storage?: string;
  format?: string;
};

/**
 * App-wide image control: device upload and/or URL import.
 * Always converts to WebP server-side and stores in cloud (or local uploads).
 */
export function ImageField({
  label,
  value,
  onChange,
  className,
  hint,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  className?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [urlDraft, setUrlDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function applyResult(r: MediaResult) {
    if (!r.success || !r.url) {
      setError(r.error ?? "Could not process image");
      return;
    }
    setError(null);
    onChange(r.url);
    const kb = r.bytes != null ? `${Math.round(r.bytes / 1024)} KB` : "";
    const dim = r.width && r.height ? `${r.width}×${r.height}` : "";
    setMeta([dim, kb, "WebP", r.storage === "blob" ? "cloud" : "app storage"].filter(Boolean).join(" · "));
  }

  function uploadFile(file: File) {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/media/upload", { method: "POST", body: fd });
      const json = (await res.json()) as MediaResult;
      applyResult(json);
    });
  }

  function importUrl() {
    const u = urlDraft.trim() || value.trim();
    if (!u) {
      setError("Paste an image URL first");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/media/import-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: u }),
      });
      const json = (await res.json()) as MediaResult;
      applyResult(json);
      if (json.success) setUrlDraft("");
    });
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-brand-muted">{label}</span>
        {value ? (
          <button
            type="button"
            className="text-[10px] font-semibold text-red-500"
            onClick={() => {
              onChange("");
              setMeta(null);
            }}
          >
            Remove
          </button>
        ) : null}
      </div>

      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="h-28 w-full rounded-xl object-cover ring-1 ring-brand-ink/10"
        />
      ) : (
        <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-brand-ink/15 bg-brand-mist/40 text-[11px] text-brand-muted">
          No image yet
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          disabled={isPending}
          className="rounded-lg border border-brand-ink/12 bg-brand-surface px-2.5 py-1.5 text-[11px] font-semibold text-brand-ink disabled:opacity-50"
          onClick={() => inputRef.current?.click()}
        >
          {isPending ? "Processing…" : "Upload from device"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadFile(f);
            e.target.value = "";
          }}
        />
      </div>

      <div className="flex gap-1.5">
        <input
          className="premium-input flex-1 font-mono text-xs"
          placeholder="Or paste image URL…"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
        />
        <button
          type="button"
          disabled={isPending}
          className="shrink-0 rounded-lg bg-brand-ink px-2.5 py-1.5 text-[11px] font-semibold text-brand-cream disabled:opacity-50 dark:bg-white dark:text-brand-cream"
          onClick={importUrl}
        >
          {isPending ? "…" : "Import"}
        </button>
      </div>

      {hint ? <p className="text-[10px] leading-snug text-brand-muted">{hint}</p> : null}
      {meta ? <p className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300">{meta}</p> : null}
      {error ? (
        <p className="rounded-lg bg-red-500/10 px-2 py-1.5 text-[10px] leading-snug text-red-600 dark:text-red-300">
          {error}
        </p>
      ) : null}
      <p className="text-[9px] leading-snug text-brand-muted">
        Converted to WebP and stored so the image works on every device. Prefer cloud Blob in
        production for large files.
      </p>
    </div>
  );
}
