"use client";

import { useState, useTransition } from "react";
import { updateBrandingAction } from "@/app/actions/business";
import { Button } from "@/components/ui/button";
import type { BrandingConfig } from "@/core/types/page";

export function BrandingForm({ businessId, initial }: { businessId: string; initial: BrandingConfig }) {
  const [branding, setBranding] = useState(initial);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          await updateBrandingAction(businessId, branding);
        });
      }}
    >
      <input
        className="w-full rounded-lg border px-3 py-2"
        placeholder="Business name"
        value={branding.businessName}
        onChange={(e) => setBranding({ ...branding, businessName: e.target.value })}
      />
      <input
        className="w-full rounded-lg border px-3 py-2"
        placeholder="Logo URL"
        value={branding.logoUrl}
        onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
      />
      <Button type="submit" disabled={isPending}>
        Save branding
      </Button>
    </form>
  );
}