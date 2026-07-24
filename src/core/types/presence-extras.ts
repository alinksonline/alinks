/**
 * Presence creator extras stored on businesses.branding.presenceExtras
 * (config only — no sales).
 */

export type PresenceMediaKit = {
  niches: string;
  platforms: string;
  approxReach: string;
  pastBrands: string;
  /** Rate card display only — not checkout */
  rateCard: string;
  workWithMeCta: string;
};

export type PresenceTestimonial = {
  id: string;
  quote: string;
  attribution: string;
};

export type PresenceHighlight = {
  id: string;
  label: string;
  href: string;
};

export type PresenceExtras = {
  mediaKit: PresenceMediaKit;
  testimonials: PresenceTestimonial[];
  brandLogos: string;
  reachChips: string;
  highlights: PresenceHighlight[];
  /** Creator Partner promo compliance (self-report) */
  partnerPromo: {
    lastPostUrl: string;
    lastPostedAt: string;
    notes: string;
    compliance: "good" | "pending" | "warning";
  };
};

export function defaultPresenceExtras(raw?: unknown): PresenceExtras {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const mk = (o.mediaKit && typeof o.mediaKit === "object" ? o.mediaKit : {}) as Record<
    string,
    unknown
  >;
  const pp = (o.partnerPromo && typeof o.partnerPromo === "object" ? o.partnerPromo : {}) as Record<
    string,
    unknown
  >;
  const testimonials = Array.isArray(o.testimonials)
    ? o.testimonials
        .map((t, i) => {
          const r = (t && typeof t === "object" ? t : {}) as Record<string, unknown>;
          return {
            id: String(r.id ?? `t-${i}`),
            quote: String(r.quote ?? ""),
            attribution: String(r.attribution ?? ""),
          };
        })
        .filter((t) => t.quote.trim())
    : [];
  const highlights = Array.isArray(o.highlights)
    ? o.highlights
        .map((h, i) => {
          const r = (h && typeof h === "object" ? h : {}) as Record<string, unknown>;
          return {
            id: String(r.id ?? `h-${i}`),
            label: String(r.label ?? ""),
            href: String(r.href ?? ""),
          };
        })
        .filter((h) => h.label.trim())
    : [];

  const compliance = pp.compliance;
  return {
    mediaKit: {
      niches: String(mk.niches ?? ""),
      platforms: String(mk.platforms ?? ""),
      approxReach: String(mk.approxReach ?? ""),
      pastBrands: String(mk.pastBrands ?? ""),
      rateCard: String(mk.rateCard ?? ""),
      workWithMeCta: String(mk.workWithMeCta ?? "Work with me"),
    },
    testimonials,
    brandLogos: String(o.brandLogos ?? ""),
    reachChips: String(o.reachChips ?? ""),
    highlights,
    partnerPromo: {
      lastPostUrl: String(pp.lastPostUrl ?? ""),
      lastPostedAt: String(pp.lastPostedAt ?? ""),
      notes: String(pp.notes ?? ""),
      compliance:
        compliance === "good" || compliance === "warning" || compliance === "pending"
          ? compliance
          : "pending",
    },
  };
}

export function readPresenceExtrasFromBranding(branding: unknown): PresenceExtras {
  const o = (branding && typeof branding === "object" ? branding : {}) as Record<string, unknown>;
  return defaultPresenceExtras(o.presenceExtras);
}
