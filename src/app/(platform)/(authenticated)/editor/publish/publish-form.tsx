"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { publishWebsiteAction, unpublishWebsiteAction } from "@/app/actions/business";
import { Button } from "@/components/ui/button";
import { cn } from "@/core/utils/cn";

export function PublishForm({
  businessId,
  handle,
  isPublished,
  canPublish,
  blockers,
}: {
  businessId: string;
  handle: string;
  isPublished: boolean;
  /** Pre-check passed (platform legal + trial). Tenant legal comes from checkbox. */
  canPublish: boolean;
  blockers: string[];
}) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (isPublished) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/12 px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">Published 100%</p>
            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Live
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-snug text-emerald-900/80 dark:text-emerald-100/85">
            Your site is public at{" "}
            <span className="font-mono font-semibold">/{handle}</span>
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-900/10 dark:bg-black/20">
            <div className="h-full w-full rounded-full bg-emerald-500" />
          </div>
          <p className="mt-1 text-right text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
            100%
          </p>
        </div>

        <a
          href={`/${handle}`}
          target="_blank"
          rel="noreferrer"
          className="premium-btn-bronze"
        >
          Open public site
        </a>

        {error && (
          <p className="rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs text-red-700 dark:text-red-300">
            {error}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={isPending}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                // Re-apply gates + re-publish all pages (refresh live content flags)
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

        <p className="text-center text-[10px] text-brand-muted">
          Republish refreshes public pages. Unpublish takes the whole site offline.
        </p>
      </div>
    );
  }

  const ready = canPublish && confirm;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-brand-ink/10 bg-brand-surface px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-brand-ink">Publish progress</p>
          <span className="text-[10px] font-bold text-brand-muted">Draft</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-mist">
          <div className="h-full w-[35%] rounded-full bg-brand-purple/70" />
        </div>
        <p className="mt-1 text-[10px] text-brand-muted">Not public yet — confirm below to go live.</p>
      </div>

      {blockers.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:text-amber-200">
            Still needed
          </p>
          <ul className="mt-1.5 space-y-1">
            {blockers.map((b) => (
              <li key={b} className="flex gap-1.5 text-xs leading-snug text-amber-900 dark:text-amber-100">
                <span className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-300">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {canPublish && (
        <label
          className={cn(
            "flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5 active:bg-brand-mist/40",
            confirm
              ? "border-brand-purple/40 bg-brand-purple/10"
              : "border-brand-ink/12 bg-brand-surface",
          )}
        >
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-brand-ink/25 bg-brand-surface accent-brand-purple"
            checked={confirm}
            onChange={(e) => setConfirm(e.target.checked)}
          />
          <span className="text-xs leading-snug text-brand-ink">
            I confirm my Terms & Privacy on this site are accurate, and the independent-operator footer
            is shown.
          </span>
        </label>
      )}

      {error && (
        <p className="rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      <Button
        type="button"
        className="w-full"
        disabled={isPending || !ready}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await publishWebsiteAction(businessId, confirm);
            if (!result.success) setError(result.error ?? "Could not publish");
            else router.refresh();
          });
        }}
      >
        {isPending ? "Publishing…" : "Publish website"}
      </Button>

      {!canPublish && (
        <p className="text-center text-[10px] text-brand-muted">
          Fix the items above, then return here to go live.
        </p>
      )}
      {canPublish && !confirm && (
        <p className="text-center text-[10px] text-brand-muted">Tick the box to enable Publish.</p>
      )}
    </div>
  );
}
