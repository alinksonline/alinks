"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeOnboardingAction } from "@/app/actions/business";
import { LegalAgreementField } from "@/components/legal/legal-agreement-field";
import { Button } from "@/components/ui/button";
import type { SiteTemplateId } from "@/core/types/page";

const VERTICALS = ["general", "salon", "ecommerce", "grocery", "clinic", "pharmacy", "restaurant"];
const TEMPLATES: { id: SiteTemplateId; label: string }[] = [
  { id: "general", label: "General business" },
  { id: "salon", label: "Salon & beauty" },
  { id: "ecommerce", label: "Shop / kirana" },
];

export function OnboardingForm() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [handle, setHandle] = useState("");
  const [vertical, setVertical] = useState("general");
  const [templateId, setTemplateId] = useState<SiteTemplateId>("general");
  const [acceptTos, setAcceptTos] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptAup, setAcceptAup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await completeOnboardingAction({
        businessName,
        handle,
        vertical,
        templateId,
        acceptTos,
        acceptPrivacy,
        acceptAup,
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
        <label className="mb-1 block text-sm font-medium">Business name</label>
        <input
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="w-full rounded-lg border px-3 py-2.5"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Handle (alinks.online/your-handle)</label>
        <input
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="my-shop"
          className="w-full rounded-lg border px-3 py-2.5"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Vertical</label>
        <select value={vertical} onChange={(e) => setVertical(e.target.value)} className="w-full rounded-lg border px-3 py-2.5">
          {VERTICALS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Template</label>
        <div className="grid gap-2">
          {TEMPLATES.map((t) => (
            <label key={t.id} className="flex cursor-pointer items-center gap-2 rounded-lg border p-3">
              <input
                type="radio"
                name="template"
                checked={templateId === t.id}
                onChange={() => setTemplateId(t.id)}
              />
              {t.label}
            </label>
          ))}
        </div>
      </div>
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