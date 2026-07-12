"use client";

import { useState, useTransition } from "react";
import { updateBrandingAction } from "@/app/actions/business";
import { Button } from "@/components/ui/button";
import { ImageField } from "@/components/shared/image-field";
import type { BrandingConfig } from "@/core/types/page";

export function BrandingForm({ businessId, initial }: { businessId: string; initial: BrandingConfig }) {
  const [branding, setBranding] = useState(initial);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4 pb-28"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const r = await updateBrandingAction(businessId, branding);
          setMessage(r.success ? "Branding saved" : r.error ?? "Save failed");
        });
      }}
    >
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Business name</span>
        <input
          className="premium-input"
          placeholder="Your business name"
          value={branding.businessName}
          onChange={(e) => setBranding({ ...branding, businessName: e.target.value })}
          autoComplete="organization"
        />
      </label>

      <ImageField
        label="Logo"
        value={branding.logoUrl}
        onChange={(logoUrl) => setBranding({ ...branding, logoUrl })}
        hint="Square logo works best. Converted to WebP and stored in the cloud."
      />

      <ImageField
        label="Cover image"
        value={branding.coverUrl ?? ""}
        onChange={(coverUrl) => setBranding({ ...branding, coverUrl })}
      />

      <ImageField
        label="Favicon"
        value={branding.faviconUrl ?? ""}
        onChange={(faviconUrl) => setBranding({ ...branding, faviconUrl })}
      />

      {message && <p className="text-sm text-brand-ink/70">{message}</p>}

      <div className="editor-sticky-actions">
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Saving…" : "Save branding"}
        </Button>
      </div>
    </form>
  );
}
