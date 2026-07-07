"use client";

import { useTransition } from "react";
import { switchActiveBusinessAction } from "@/app/actions/multi-business";

export function BusinessSwitcher({
  businesses,
  activeId,
}: {
  businesses: { id: string; name: string; handle: string }[];
  activeId?: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  if (businesses.length <= 1) return null;

  return (
    <select
      className="rounded-lg border px-2 py-1 text-sm"
      disabled={isPending}
      value={activeId ?? businesses[0]?.id}
      onChange={(e) => startTransition(async () => { await switchActiveBusinessAction(e.target.value); })}
    >
      {businesses.map((b) => (
        <option key={b.id} value={b.id}>{b.name}</option>
      ))}
    </select>
  );
}
