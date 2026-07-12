"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { publishWebsiteAction, unpublishWebsiteAction } from "@/app/actions/business";
import { Button } from "@/components/ui/button";
import { cn } from "@/core/utils/cn";

export function DashboardPublishStatus({
  businessId,
  handle,
  isPublished,
}: {
  businessId: string;
  handle: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (isPublished) {
    return (
      <div
        className={cn(
          "rounded-xl border border-emerald-500/35 bg-emerald-500/12 px-3 py-3",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
              Published 100%
            </p>
            <p className="mt-0.5 text-[11px] text-emerald-900/80 dark:text-emerald-100/80">
              Your mini-site is live for visitors.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Live
          </span>
        </div>

        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-emerald-900/10 dark:bg-black/25">
          <div className="h-full w-full rounded-full bg-emerald-500" aria-hidden />
        </div>
        <p className="mt-1 text-right text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
          100%
        </p>

        <a
          href={`/${handle}`}
          target="_blank"
          rel="noreferrer"
          className="mt-2 flex min-h-[var(--ctrl-h)] items-center justify-between rounded-[var(--ctrl-radius)] border border-emerald-600/25 bg-brand-surface px-3 text-xs font-semibold text-brand-ink active:scale-[0.99]"
        >
          <span>Open public site</span>
          <span className="font-mono text-[11px] text-brand-muted">/{handle} →</span>
        </a>

        {error && (
          <p className="mt-2 rounded-lg bg-red-500/10 px-2 py-1 text-[11px] text-red-700 dark:text-red-300">
            {error}
          </p>
        )}

        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={isPending}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const result = await publishWebsiteAction(businessId, true);
                if (!result.success) setError(result.error ?? "Could not republish");
                else router.refresh();
              });
            }}
          >
            {isPending ? "…" : "Republish"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full border-red-500/25 text-red-700 dark:text-red-300"
            disabled={isPending}
            onClick={() => {
              if (!window.confirm("Unpublish your site? Visitors will no longer see it.")) return;
              setError(null);
              startTransition(async () => {
                const result = await unpublishWebsiteAction(businessId);
                if (!result.success) setError(result.error ?? "Could not unpublish");
                else router.refresh();
              });
            }}
          >
            {isPending ? "…" : "Unpublish"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-amber-900 dark:text-amber-100">Not published</p>
          <p className="mt-0.5 text-[11px] text-amber-900/75 dark:text-amber-100/75">
            Finish your site, then go live.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-amber-600/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Draft
        </span>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-amber-900/10 dark:bg-black/25">
        <div className="h-full w-[35%] rounded-full bg-amber-500" aria-hidden />
      </div>
      <p className="mt-1 text-right text-[10px] font-semibold text-amber-800 dark:text-amber-200">
        ~35%
      </p>
      <Link href="/editor/publish" className="premium-btn-bronze mt-2">
        Go live
      </Link>
    </div>
  );
}
