"use client";

import { useTransition } from "react";
import { reviewAdSlotAction } from "@/app/actions/superadmin";

export function AdReviewButtons({ slotId }: { slotId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={isPending}
        className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-600 disabled:opacity-50"
        onClick={() => startTransition(async () => { await reviewAdSlotAction(slotId, true); })}
      >
        Approve
      </button>
      <button
        type="button"
        disabled={isPending}
        className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold hover:bg-slate-600 disabled:opacity-50"
        onClick={() => startTransition(async () => { await reviewAdSlotAction(slotId, false); })}
      >
        Reject
      </button>
    </div>
  );
}