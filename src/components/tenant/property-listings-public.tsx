"use client";

import { useState, useTransition } from "react";
import { submitPropertyLeadAction } from "@/app/actions/real-estate";
import { whatsappUrl } from "@/core/utils/business-profile";

type Listing = {
  id: string;
  title: string;
  description: string | null;
  listingType: string;
  visibility: string;
  city: string | null;
  locality: string | null;
  priceLabel: string | null;
  bedrooms: number | null;
  areaSqft: number | null;
};

export function PropertyListingsPublic({
  handle,
  businessName,
  listings,
  whatsapp,
}: {
  handle: string;
  businessName: string;
  listings: Listing[];
  whatsapp?: string;
}) {
  const [filter, setFilter] = useState("all");
  const [leadListing, setLeadListing] = useState<Listing | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const types = Array.from(new Set(listings.map((l) => l.listingType)));
  const filtered =
    filter === "all" ? listings : listings.filter((l) => l.listingType === filter);

  if (!listings.length) {
    return (
      <div className="t-card px-4 py-10 text-center">
        <p className="t-ink text-sm font-semibold">No open listings yet</p>
        <p className="t-muted mt-1 text-xs">Contact the agent for private inventory.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="t-slot-chip"
          data-selected={filter === "all" ? "true" : "false"}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        {types.map((t) => (
          <button
            key={t}
            type="button"
            className="t-slot-chip"
            data-selected={filter === t ? "true" : "false"}
            onClick={() => setFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {filtered.map((l) => {
          const waMsg = `Hi ${businessName}! Interested in: ${l.title} (${l.listingType})${l.city ? ` · ${l.city}` : ""}`;
          const waHref = whatsapp
            ? whatsappUrl(whatsapp, waMsg)
            : `https://wa.me/?text=${encodeURIComponent(waMsg)}`;
          return (
            <article key={l.id} className="t-card p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="t-muted text-[10px] font-bold uppercase tracking-wider">
                    {l.listingType}
                    {l.visibility === "teaser" ? " · teaser" : ""}
                  </p>
                  <h2 className="t-ink mt-0.5 text-sm font-bold">{l.title}</h2>
                  <p className="t-muted mt-0.5 text-xs">
                    {[l.locality, l.city].filter(Boolean).join(", ")}
                    {l.bedrooms != null ? ` · ${l.bedrooms} BHK` : ""}
                    {l.areaSqft != null ? ` · ${l.areaSqft} sqft` : ""}
                  </p>
                  {l.description ? (
                    <p className="t-muted mt-1.5 text-xs leading-relaxed">{l.description}</p>
                  ) : null}
                </div>
                <p
                  className="shrink-0 text-sm font-bold"
                  style={{ color: "var(--t-primary-text, var(--t-primary))" }}
                >
                  {l.priceLabel || "—"}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="t-btn-primary !min-h-9 !w-auto !px-4 text-xs"
                  onClick={() => {
                    setLeadListing(l);
                    setStatus(null);
                  }}
                >
                  Send lead
                </button>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full bg-[#25D366] px-4 py-2 text-xs font-bold text-white"
                >
                  WhatsApp
                </a>
              </div>
            </article>
          );
        })}
      </div>

      {leadListing ? (
        <div className="t-card mt-5 space-y-3 p-4">
          <p className="text-sm font-bold">Lead: {leadListing.title}</p>
          <p className="t-muted text-[11px]">Saved to the agent&apos;s data sheet — not ALINKS platform DB.</p>
          <input
            className="t-input"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="t-input"
            placeholder="10-digit phone"
            inputMode="numeric"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          />
          <textarea
            className="t-input min-h-[72px]"
            placeholder="Message (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="t-btn-primary"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const r = await submitPropertyLeadAction({
                    handle,
                    listingId: leadListing.id,
                    listingTitle: leadListing.title,
                    name,
                    phone,
                    message,
                  });
                  if (!r.success) {
                    setStatus(r.error ?? "Failed");
                    return;
                  }
                  setStatus("Lead sent. The agent will contact you.");
                  setName("");
                  setPhone("");
                  setMessage("");
                  setLeadListing(null);
                })
              }
            >
              Submit lead
            </button>
            <button type="button" className="text-xs font-semibold" onClick={() => setLeadListing(null)}>
              Cancel
            </button>
          </div>
          {status ? <p className="text-xs font-medium">{status}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
