"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { publishWebsiteAction } from "@/app/actions/business";
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
      <div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-5">
        <p className="text-base font-bold text-emerald-800">Your site is live</p>
        <a
          href={`/${handle}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-emerald-700 text-sm font-bold text-white active:scale-[0.99]"
        >
          Open public site
        </a>
      </div>
    );
  }

  const ready = canPublish && confirm;

  return (
    <div className="space-y-4">
      {blockers.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Still needed</p>
          <ul className="mt-2 space-y-2">
            {blockers.map((b) => (
              <li key={b} className="flex gap-2 text-sm leading-snug text-amber-900">
                <span className="mt-0.5 shrink-0 text-amber-600">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {canPublish && (
        <label
          className={cn(
            "flex min-h-[3.25rem] cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3.5 active:bg-brand-mist/50",
            confirm ? "border-brand-purple/30 bg-brand-purple/5" : "border-brand-ink/10 bg-white",
          )}
        >
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 shrink-0 rounded border-brand-ink/20"
            checked={confirm}
            onChange={(e) => setConfirm(e.target.checked)}
          />
          <span className="text-sm leading-snug text-brand-ink">
            I confirm my Terms & Privacy on this site are accurate, and the independent-operator footer is shown.
          </span>
        </label>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <Button
        type="button"
        className="min-h-12 w-full rounded-2xl"
        disabled={isPending || !ready}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await publishWebsiteAction(businessId, confirm);
            if (!result.success) setError(result.error ?? "Could not publish");
            else {
              // Full navigation so “Your site is live” + public link refresh reliably
              router.refresh();
              router.push(`/editor/publish`);
            }
          });
        }}
      >
        {isPending ? "Publishing…" : "Publish website"}
      </Button>

      {!canPublish && (
        <p className="text-center text-[11px] text-brand-ink/45">
          Fix the items above, then return here to go live.
        </p>
      )}
      {canPublish && !confirm && (
        <p className="text-center text-[11px] text-brand-ink/45">Tick the box to enable Publish.</p>
      )}
    </div>
  );
}
