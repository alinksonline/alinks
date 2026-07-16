"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeOnboardingAction } from "@/app/actions/business";
import { LegalAgreementField } from "@/components/legal/legal-agreement-field";
import { Button } from "@/components/ui/button";
import {
  CREATOR_PARTNER_TIERS,
  isCreatorPartnerEligible,
  selectableIndustries,
  type CreatorPartnerTierCode,
  type IndustryGroup,
} from "@/core/config/industries";
import type { SiteTemplateId } from "@/core/types/page";

const TEMPLATE_BY_GROUP: Partial<Record<IndustryGroup, SiteTemplateId>> = {
  presence: "presence",
  salon_beauty: "salon",
  retail: "ecommerce",
  food: "food",
  bookings: "bookings",
  real_estate: "real_estate",
  education: "education",
  fitness: "fitness",
  automotive: "automotive",
  general: "general",
  pharmacy: "general",
};

export function OnboardingForm() {
  const router = useRouter();
  const industries = useMemo(() => selectableIndustries(), []);
  const [industryGroup, setIndustryGroup] = useState<IndustryGroup>("presence");
  const [industryType, setIndustryType] = useState("influencer_creator");
  const [businessName, setBusinessName] = useState("");
  const [handle, setHandle] = useState("");
  const [acceptTos, setAcceptTos] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptAup, setAcceptAup] = useState(false);
  const [acceptCreatorPartner, setAcceptCreatorPartner] = useState(false);
  const [creatorTier, setCreatorTier] = useState<CreatorPartnerTierCode>("B");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const industry = industries.find((i) => i.group === industryGroup) ?? industries[0];
  const types = industry?.types ?? [];
  const creatorEligible = isCreatorPartnerEligible(industryGroup, industryType);
  const templateId: SiteTemplateId = TEMPLATE_BY_GROUP[industryGroup] ?? "general";

  const onIndustryChange = (group: IndustryGroup) => {
    setIndustryGroup(group);
    const def = industries.find((i) => i.group === group);
    const first = def?.types[0]?.slug ?? "general";
    setIndustryType(first);
    setAcceptCreatorPartner(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (creatorEligible && acceptCreatorPartner && !creatorTier) {
      setError("Choose a Creator Partner tier for Creator pricing.");
      return;
    }

    startTransition(async () => {
      const result = await completeOnboardingAction({
        businessName,
        handle,
        vertical: industryGroup === "presence" ? "presence" : industryType,
        industryGroup,
        industryType,
        templateId,
        acceptTos,
        acceptPrivacy,
        acceptAup,
        acceptCreatorPartner: creatorEligible && acceptCreatorPartner,
        creatorPartnerTier: creatorEligible && acceptCreatorPartner ? creatorTier : undefined,
      });
      if (!result.success) {
        setError(result.error ?? "Failed");
        return;
      }
      router.push("/editor");
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium">Display name</label>
        <input
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="w-full rounded-lg border px-3 py-2.5"
          placeholder="Your name or brand"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Handle (alinks.online/your-handle)</label>
        <input
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="my-profile"
          className="w-full rounded-lg border px-3 py-2.5"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Industry</label>
        <select
          value={industryGroup}
          onChange={(e) => onIndustryChange(e.target.value as IndustryGroup)}
          className="w-full rounded-lg border px-3 py-2.5"
        >
          {industries.map((i) => (
            <option key={i.group} value={i.group}>
              {i.label}
            </option>
          ))}
        </select>
        {industry && <p className="mt-1.5 text-xs text-brand-muted">{industry.description}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Type</label>
        <div className="grid gap-2">
          {types.map((t) => (
            <label
              key={t.slug}
              className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 ${
                industryType === t.slug ? "border-brand-ink/30 bg-brand-mist/50" : ""
              }`}
            >
              <input
                type="radio"
                name="industryType"
                checked={industryType === t.slug}
                onChange={() => {
                  setIndustryType(t.slug);
                  setAcceptCreatorPartner(false);
                }}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium">{t.label}</span>
                <span className="mt-0.5 block text-xs text-brand-muted">{t.description}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {industryGroup === "presence" && (
        <div className="rounded-xl border border-violet-200 bg-violet-50/80 px-4 py-3 text-sm text-violet-950">
          <p className="font-semibold">No selling on ALINKS</p>
          <p className="mt-1 text-xs leading-relaxed text-violet-900/80">
            Presence is a profile and link hub only. Store, checkout, and packages stay off. You can switch
            industry later if you want to sell or take bookings.
          </p>
        </div>
      )}

      {creatorEligible && (
        <div className="space-y-3 rounded-xl border border-brand-ink/10 bg-brand-mist/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink/45">Creator Partner</p>
          <p className="text-sm text-brand-ink">
            Get <strong>Creator pricing</strong> — deep discounts in exchange for light promo of ALINKS
            (Partner duties). Activate now; first promo due within 30 days of going live.
          </p>
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-muted">Partner tier</label>
            <select
              value={creatorTier}
              onChange={(e) => setCreatorTier(e.target.value as CreatorPartnerTierCode)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              {(Object.keys(CREATOR_PARTNER_TIERS) as CreatorPartnerTierCode[]).map((code) => {
                const t = CREATOR_PARTNER_TIERS[code];
                return (
                  <option key={code} value={code}>
                    {t.label} — ~{t.discountPctMonthly}% off ({t.summary})
                  </option>
                );
              })}
            </select>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={acceptCreatorPartner}
              onChange={(e) => setAcceptCreatorPartner(e.target.checked)}
              className="mt-1"
            />
            <span>
              I accept <strong>Creator Partner</strong> terms: keep an ALINKS mention/link as agreed for my
              tier, and complete light partner promo duties while Creator pricing is active.
            </span>
          </label>
        </div>
      )}

      <div className="space-y-4 rounded-xl border border-brand-ink/8 bg-brand-mist/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink/45">Legal agreements</p>
        <LegalAgreementField docId="tos" checked={acceptTos} onChange={setAcceptTos} />
        <LegalAgreementField docId="privacy" checked={acceptPrivacy} onChange={setAcceptPrivacy} />
        <LegalAgreementField docId="aup" checked={acceptAup} onChange={setAcceptAup} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating…" : "Create my site"}
      </Button>
    </form>
  );
}
