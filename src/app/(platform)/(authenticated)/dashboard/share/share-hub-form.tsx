"use client";

import { useState, useTransition } from "react";
import { createShareLinkAction } from "@/app/actions/share";
import { Button } from "@/components/ui/button";

export function ShareHubForm({
  businessId,
  storeUrl,
  handle,
  presence = false,
}: {
  businessId: string;
  storeUrl: string;
  handle: string;
  /** Presence share kit — profile URL, not shop. */
  presence?: boolean;
}) {
  const [label, setLabel] = useState(presence ? "My profile" : "Store catalog");
  const [targetUrl, setTargetUrl] = useState(storeUrl);
  const [shortUrl, setShortUrl] = useState("");
  const [isPending, startTransition] = useTransition();

  const whatsappText = encodeURIComponent(
    presence
      ? `Check out my profile: ${shortUrl || storeUrl}`
      : `Check out our store: ${shortUrl || storeUrl}`,
  );
  const waLink = `https://wa.me/?text=${whatsappText}`;

  return (
    <div className="mt-6 space-y-4">
      <input className="w-full rounded-lg border px-3 py-2 text-sm" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Link label" />
      <input className="w-full rounded-lg border px-3 py-2 font-mono text-sm" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="Target URL" />
      <Button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await createShareLinkAction(businessId, targetUrl, label);
            if (result.success) setShortUrl(result.shortUrl);
          })
        }
      >
        Create short link
      </Button>
      {shortUrl && (
        <div className="rounded-lg border bg-emerald-50 p-4 text-sm">
          <p className="font-mono font-semibold">{shortUrl}</p>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-semibold text-emerald-800 underline">
            Share on WhatsApp
          </a>
          <p className="mt-2 text-slate-600">
            OG preview:{" "}
            <code>
              /{handle}
              {presence ? "" : "/store"}
            </code>{" "}
            for social cards.
          </p>
        </div>
      )}
    </div>
  );
}