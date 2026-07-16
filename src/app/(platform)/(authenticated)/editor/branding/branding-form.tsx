"use client";

import { useState, useTransition } from "react";
import { updateBrandingAction } from "@/app/actions/business";
import { Button } from "@/components/ui/button";
import { ImageField } from "@/components/shared/image-field";
import {
  parseBusinessProfile,
  type BusinessProfile,
  type OgFallbackPreference,
} from "@/core/types/business-profile";
import type { BrandingConfig } from "@/core/types/page";

function toProfile(initial: BrandingConfig, fallbackName: string): BusinessProfile {
  return parseBusinessProfile(initial, fallbackName || initial.businessName || "");
}

export function BrandingForm({
  businessId,
  initial,
}: {
  businessId: string;
  initial: BrandingConfig;
}) {
  const [branding, setBranding] = useState<BusinessProfile>(() =>
    toProfile(initial, initial.businessName || ""),
  );
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const hasLogo = Boolean(branding.logoUrl?.trim());

  function set<K extends keyof BusinessProfile>(key: K, value: BusinessProfile[K]) {
    setBranding((b) => ({ ...b, [key]: value }));
  }

  return (
    <form
      className="space-y-5 pb-28"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const payload: BrandingConfig = {
            businessName: branding.businessName,
            tagline: branding.tagline,
            logoUrl: branding.logoUrl,
            faviconUrl: branding.faviconUrl,
            coverUrl: branding.coverUrl,
            ogImageUrl: branding.ogImageUrl,
            ogFallback: branding.ogFallback,
            showTitleWithLogo: branding.showTitleWithLogo,
            email: branding.email,
            phone: branding.phone,
            whatsapp: branding.whatsapp,
            address: branding.address,
            socials: branding.socials,
          };
          const r = await updateBrandingAction(businessId, payload);
          setMessage(r.success ? "Branding saved" : r.error ?? "Save failed");
        });
      }}
    >
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
          Business name
        </span>
        <input
          className="premium-input"
          placeholder="Your business name"
          value={branding.businessName}
          onChange={(e) => set("businessName", e.target.value)}
          autoComplete="organization"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
          Tagline
        </span>
        <input
          className="premium-input"
          placeholder="Short line under your name (optional)"
          value={branding.tagline}
          onChange={(e) => set("tagline", e.target.value)}
        />
      </label>

      <ImageField
        label="Logo"
        value={branding.logoUrl}
        onChange={(logoUrl) => set("logoUrl", logoUrl)}
        emptyDimensions="Height ~80–120 px · width auto (any shape)"
        hint="Any logo shape works — icon, wordmark, or logo + tagline art."
        previewClassName="h-20 w-full object-contain bg-brand-mist/30"
      />

      {hasLogo ? (
        <label className="flex items-start gap-3 rounded-xl border border-brand-ink/10 bg-brand-surface px-3 py-3">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-brand-ink/20"
            checked={branding.showTitleWithLogo}
            onChange={(e) => set("showTitleWithLogo", e.target.checked)}
          />
          <span>
            <span className="block text-sm font-semibold text-brand-ink">Show title &amp; tagline</span>
            <span className="mt-0.5 block text-[11px] leading-snug text-brand-muted">
              Turn off if your logo already includes the business name (logo-only header).
            </span>
          </span>
        </label>
      ) : null}

      <ImageField
        label="Cover image"
        value={branding.coverUrl}
        onChange={(coverUrl) => set("coverUrl", coverUrl)}
        emptyDimensions="Recommended: 1200 × 630 px (≈1.91:1) or 16:9"
        hint="Used for the site banner and as the default link preview when no OG image is set."
      />

      <ImageField
        label="Favicon / app icon"
        value={branding.faviconUrl}
        onChange={(faviconUrl) => set("faviconUrl", faviconUrl)}
        emptyDimensions="Prefer square 1:1 (e.g. 512 × 512)"
        hint="Used as browser tab icon and app icon. Can also be a link-preview fallback."
        previewClassName="mx-auto h-16 w-16 object-cover"
      />

      <ImageField
        label="OG image (link preview)"
        value={branding.ogImageUrl}
        onChange={(ogImageUrl) => set("ogImageUrl", ogImageUrl)}
        emptyDimensions="Recommended: 1200 × 630 px (WhatsApp / link cards)"
        hint="Best for WhatsApp / Instagram / Facebook shares. Optional — if empty, uses the fallback below."
      />

      <div className="rounded-xl border border-brand-ink/10 bg-brand-mist/30 px-3 py-3">
        <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
          Link preview when OG image is empty
        </p>
        <p className="mt-1 text-[11px] leading-snug text-brand-muted">
          Default is Cover (looks best as a wide card). Choose Favicon if you only want your square mark.
        </p>
        <div className="mt-2 flex gap-1.5">
          {(
            [
              { id: "cover" as const, label: "Cover (default)" },
              { id: "favicon" as const, label: "Favicon" },
            ] as { id: OgFallbackPreference; label: string }[]
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => set("ogFallback", opt.id)}
              className={`flex-1 rounded-lg border px-2 py-1.5 text-[11px] font-semibold ${
                branding.ogFallback === opt.id
                  ? "border-brand-purple/40 bg-brand-purple/10 text-brand-ink"
                  : "border-brand-ink/10 bg-brand-surface text-brand-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[10px] leading-snug text-brand-muted">
        Any image type is fine — we convert to WebP, keep resolution (within limits), shrink file size,
        and store in cloud media for your account.
      </p>

      {message && <p className="text-sm text-brand-ink/70">{message}</p>}

      <div className="editor-sticky-actions">
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Saving…" : "Save branding"}
        </Button>
      </div>
    </form>
  );
}
