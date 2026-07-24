"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { savePresenceExtrasAction } from "@/app/actions/presence";
import type { PresenceExtras } from "@/core/types/presence-extras";
import { Button } from "@/components/ui/button";

export function PresenceEditorPanel({
  businessId,
  initial,
  flags,
}: {
  businessId: string;
  initial: PresenceExtras;
  flags: { mediaKit: boolean; socialProof: boolean; highlights: boolean };
}) {
  const router = useRouter();
  const [extras, setExtras] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function setMediaKit(field: keyof PresenceExtras["mediaKit"], value: string) {
    setExtras((e) => ({ ...e, mediaKit: { ...e.mediaKit, [field]: value } }));
  }

  return (
    <div className="mt-5 space-y-4">
      <section className="premium-card space-y-3 px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-brand-ink">Media kit</p>
          {!flags.mediaKit ? (
            <span className="text-[10px] font-semibold uppercase text-amber-700">Add module</span>
          ) : null}
        </div>
        {(
          [
            ["niches", "Niches"],
            ["platforms", "Platforms"],
            ["approxReach", "Approx reach"],
            ["pastBrands", "Past brands"],
            ["rateCard", "Rate card (display only)"],
            ["workWithMeCta", "Primary CTA label"],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <label className="mb-1 block text-xs text-brand-muted">{label}</label>
            <textarea
              className="w-full rounded-lg border px-3 py-2 text-sm"
              rows={key === "rateCard" ? 3 : 2}
              value={extras.mediaKit[key]}
              onChange={(e) => setMediaKit(key, e.target.value)}
              disabled={!flags.mediaKit && key !== "workWithMeCta"}
            />
          </div>
        ))}
      </section>

      <section className="premium-card space-y-3 px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-brand-ink">Social proof</p>
          {!flags.socialProof ? (
            <span className="text-[10px] font-semibold uppercase text-amber-700">Add module</span>
          ) : null}
        </div>
        <div>
          <label className="mb-1 block text-xs text-brand-muted">Reach chips (comma-separated)</label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={extras.reachChips}
            disabled={!flags.socialProof}
            onChange={(e) => setExtras((x) => ({ ...x, reachChips: e.target.value }))}
            placeholder="120k IG · 40k YT"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-brand-muted">Brand logos / as-seen-on (text)</label>
          <textarea
            className="w-full rounded-lg border px-3 py-2 text-sm"
            rows={2}
            value={extras.brandLogos}
            disabled={!flags.socialProof}
            onChange={(e) => setExtras((x) => ({ ...x, brandLogos: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-brand-muted">
            Testimonials (one per line: quote | attribution)
          </label>
          <textarea
            className="w-full rounded-lg border px-3 py-2 text-sm"
            rows={4}
            disabled={!flags.socialProof}
            value={extras.testimonials.map((t) => `${t.quote} | ${t.attribution}`).join("\n")}
            onChange={(e) => {
              const testimonials = e.target.value
                .split("\n")
                .map((line, i) => {
                  const [quote, ...rest] = line.split("|");
                  return {
                    id: `t-${i}`,
                    quote: (quote ?? "").trim(),
                    attribution: rest.join("|").trim(),
                  };
                })
                .filter((t) => t.quote);
              setExtras((x) => ({ ...x, testimonials }));
            }}
          />
        </div>
      </section>

      <section className="premium-card space-y-3 px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-brand-ink">Highlights</p>
          {!flags.highlights ? (
            <span className="text-[10px] font-semibold uppercase text-amber-700">Add module</span>
          ) : null}
        </div>
        <textarea
          className="w-full rounded-lg border px-3 py-2 text-sm"
          rows={3}
          disabled={!flags.highlights}
          placeholder="Travel | https://...\nFood | /gallery"
          value={extras.highlights.map((h) => `${h.label} | ${h.href}`).join("\n")}
          onChange={(e) => {
            const highlights = e.target.value
              .split("\n")
              .map((line, i) => {
                const [label, ...rest] = line.split("|");
                return {
                  id: `h-${i}`,
                  label: (label ?? "").trim(),
                  href: rest.join("|").trim(),
                };
              })
              .filter((h) => h.label);
            setExtras((x) => ({ ...x, highlights }));
          }}
        />
      </section>

      <Button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const res = await savePresenceExtrasAction(businessId, extras);
            setMessage(res.success ? "Saved." : (res.error ?? "Failed"));
            router.refresh();
          })
        }
      >
        Save presence studio
      </Button>
      {message ? <p className="text-sm text-brand-ink">{message}</p> : null}
    </div>
  );
}
