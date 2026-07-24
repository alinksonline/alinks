"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markCreatorPromoPostedAction } from "@/app/actions/presence";
import { Button } from "@/components/ui/button";

export function CreatorPartnerPanel({
  businessId,
  tier,
  tierLabel,
  acceptedAt,
  promo,
  handle,
}: {
  businessId: string;
  tier: string;
  tierLabel: string;
  acceptedAt: string | null;
  promo: {
    lastPostUrl: string;
    lastPostedAt: string;
    notes: string;
    compliance: string;
  };
  handle: string;
}) {
  const router = useRouter();
  const [url, setUrl] = useState(promo.lastPostUrl);
  const [notes, setNotes] = useState(promo.notes);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const siteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${handle}`
      : `https://alinks.online/${handle}`;

  return (
    <div className="mt-5 space-y-4">
      <div className="premium-card px-4 py-4 text-sm">
        <p className="font-semibold text-brand-ink">
          Tier {tier} — {tierLabel}
        </p>
        {acceptedAt ? (
          <p className="mt-1 text-xs text-brand-muted">
            Accepted {new Date(acceptedAt).toLocaleDateString()}
          </p>
        ) : null}
        <p className="mt-2 text-xs text-brand-muted">
          Compliance:{" "}
          <strong className="text-brand-ink">{promo.compliance}</strong>
          {promo.lastPostedAt
            ? ` · last marked ${new Date(promo.lastPostedAt).toLocaleDateString()}`
            : " · no promo marked yet"}
        </p>
      </div>

      <div className="premium-card space-y-3 px-4 py-4">
        <p className="text-sm font-semibold text-brand-ink">Checklist</p>
        <ul className="list-inside list-disc space-y-1 text-xs text-brand-muted">
          <li>Keep ALINKS link on your link hub or bio while Partner pricing is active</li>
          <li>Launch post (Story + feed/Reel or community post) within 30 days of go-live</li>
          <li>Light reminder every ~90 days while discount is active</li>
          <li>
            Mention your site: <code className="text-[10px]">{siteUrl}</code>
          </li>
        </ul>
        <p className="text-[11px] text-brand-muted">
          Suggested caption: &quot;My link hub is on ALINKS — pro online presence. Creators get Creator
          pricing: alinks.online&quot;
        </p>
      </div>

      <div className="premium-card space-y-3 px-4 py-4">
        <p className="text-sm font-semibold text-brand-ink">Mark promo as posted</p>
        <div>
          <label className="mb-1 block text-xs text-brand-muted">Post URL</label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://instagram.com/p/..."
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-brand-muted">Notes (optional)</label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Story + feed, 21 Jul"
          />
        </div>
        <Button
          type="button"
          disabled={isPending || !url.trim()}
          onClick={() =>
            startTransition(async () => {
              const res = await markCreatorPromoPostedAction(businessId, url, notes);
              setMessage(res.success ? "Saved — thank you." : (res.error ?? "Failed"));
              router.refresh();
            })
          }
        >
          Save promo
        </Button>
        {message ? <p className="text-sm text-brand-ink">{message}</p> : null}
      </div>
    </div>
  );
}
