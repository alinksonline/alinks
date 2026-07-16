"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { switchIndustryAction } from "@/app/actions/billing-modules";
import { Button } from "@/components/ui/button";
import {
  selectableIndustries,
  type IndustryGroup,
} from "@/core/config/industries";

export function IndustrySwitchPanel({
  currentGroup,
  currentType,
}: {
  currentGroup: string;
  currentType: string;
}) {
  const router = useRouter();
  const industries = useMemo(
    () => selectableIndustries().filter((i) => i.group !== "pharmacy"),
    [],
  );
  const [group, setGroup] = useState<IndustryGroup>(
    (currentGroup as IndustryGroup) || "presence",
  );
  const [type, setType] = useState(currentType || "influencer_creator");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const def = industries.find((i) => i.group === group) ?? industries[0];
  const types = def?.types ?? [];

  const isPresence = currentGroup === "presence";

  return (
    <section className="mt-10 rounded-2xl border border-brand-ink/10 bg-white p-4">
      <p className="premium-label">{isPresence ? "Upgrade path" : "Industry"}</p>
      <h2 className="mt-1 text-lg font-bold text-brand-ink">
        {isPresence ? "Sell or take bookings" : "Switch industry"}
      </h2>
      <p className="mt-1 text-sm text-brand-muted">
        {isPresence
          ? "Presence is link-hub only. Switch industry to unlock salon, food, retail, or other tools — then Select modules for paid add-ons."
          : "Changing industry updates allowed modules and editor tools. Your site content is kept; re-check packages/menu after switching."}
      </p>

      <div className="mt-4 space-y-3">
        <label className="block text-sm">
          <span className="text-xs font-semibold text-brand-muted">Industry</span>
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            value={group}
            onChange={(e) => {
              const g = e.target.value as IndustryGroup;
              setGroup(g);
              const next = industries.find((i) => i.group === g);
              setType(next?.types[0]?.slug ?? "general");
            }}
          >
            {industries.map((i) => (
              <option key={i.group} value={i.group}>
                {i.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold text-brand-muted">Type</span>
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {types.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <Button
          type="button"
          disabled={isPending || (group === currentGroup && type === currentType)}
          onClick={() =>
            startTransition(async () => {
              const r = await switchIndustryAction({ industryGroup: group, industryType: type });
              if (!r.success) {
                setMessage(r.error);
                return;
              }
              setMessage("Industry updated. Open Select modules for paid add-ons.");
              router.refresh();
            })
          }
        >
          {isPending ? "Switching…" : "Apply industry"}
        </Button>
        {message ? <p className="text-sm text-brand-muted">{message}</p> : null}
      </div>
    </section>
  );
}
