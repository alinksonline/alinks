"use client";

import { useState, useTransition } from "react";
import { updateBusinessProfileAction } from "@/app/actions/business";
import { Button } from "@/components/ui/button";
import { ImageField } from "@/components/shared/image-field";
import type { BusinessProfile } from "@/core/types/business-profile";
import { defaultBusinessProfile } from "@/core/types/business-profile";

export function BusinessProfileForm({
  businessId,
  initial,
}: {
  businessId: string;
  initial: BusinessProfile;
}) {
  const [profile, setProfile] = useState<BusinessProfile>(() => defaultBusinessProfile(initial));
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const set =
    (key: keyof BusinessProfile) =>
    (value: string) =>
      setProfile((p) => ({ ...p, [key]: value }));

  const setSocial =
    (key: keyof BusinessProfile["socials"]) =>
    (value: string) =>
      setProfile((p) => ({ ...p, socials: { ...p.socials, [key]: value } }));

  return (
    <form
      className="space-y-5 pb-28"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const r = await updateBusinessProfileAction(businessId, profile);
          setMessage(r.success ? "Business profile saved — header, footer & contact will use this." : r.error ?? "Save failed");
        });
      }}
    >
      <p className="rounded-2xl border border-brand-purple/15 bg-brand-purple/5 px-4 py-3 text-xs leading-relaxed text-brand-ink/70">
        This is the <strong>single source of truth</strong> for your business identity. Phone, WhatsApp, email and
        social handles feed your site header, footer, and contact sections.
      </p>

      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wide text-brand-ink/45">Identity</h2>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-brand-ink">Business name *</span>
          <input
            className="premium-input"
            value={profile.businessName}
            onChange={(e) => set("businessName")(e.target.value)}
            required
            autoComplete="organization"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-brand-ink">Business email</span>
          <input
            className="premium-input"
            type="email"
            value={profile.email}
            onChange={(e) => set("email")(e.target.value)}
            placeholder="hello@yourbusiness.com"
            inputMode="email"
            autoComplete="email"
          />
        </label>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wide text-brand-ink/45">Phone & WhatsApp</h2>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-brand-ink">Public phone</span>
          <input
            className="premium-input"
            value={profile.phone}
            onChange={(e) => set("phone")(e.target.value)}
            placeholder="9876543210"
            inputMode="tel"
            autoComplete="tel"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-brand-ink">WhatsApp number</span>
          <input
            className="premium-input"
            value={profile.whatsapp}
            onChange={(e) => set("whatsapp")(e.target.value)}
            placeholder="919876543210 (with country code)"
            inputMode="tel"
          />
          <span className="text-[11px] text-brand-ink/40">Used for WhatsApp buttons site-wide. Leave blank to use phone.</span>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-brand-ink">Address (optional)</span>
          <textarea
            className="premium-input min-h-[4rem]"
            value={profile.address}
            onChange={(e) => set("address")(e.target.value)}
            rows={2}
            placeholder="Shop / salon address"
          />
        </label>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wide text-brand-ink/45">Social handles only</h2>
        <p className="text-[11px] text-brand-ink/45">Enter handle only — no full URL. Example: <code className="rounded bg-brand-mist px-1">priya_salon</code></p>
        {(
          [
            ["instagram", "Instagram"],
            ["facebook", "Facebook"],
            ["youtube", "YouTube"],
            ["x", "X (Twitter)"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block space-y-1.5">
            <span className="text-sm font-semibold text-brand-ink">{label}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-brand-ink/40">@</span>
              <input
                className="premium-input"
                value={profile.socials[key]}
                onChange={(e) => setSocial(key)(e.target.value)}
                placeholder="your_handle"
                autoComplete="off"
              />
            </div>
          </label>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wide text-brand-ink/45">Logo (optional)</h2>
        <ImageField
          label="Logo image"
          value={profile.logoUrl}
          onChange={(logoUrl) => set("logoUrl")(logoUrl)}
          hint="Height ~80–120px; width auto. Full branding (cover, favicon, OG, title toggle) is under Editor → Branding."
          previewClassName="h-20 w-full object-contain bg-brand-mist/30"
        />
      </section>

      {message && <p className="text-sm text-brand-ink/70">{message}</p>}

      <div className="editor-sticky-actions">
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Saving…" : "Save business profile"}
        </Button>
      </div>
    </form>
  );
}
