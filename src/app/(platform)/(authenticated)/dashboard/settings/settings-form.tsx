"use client";

import { useState, useTransition } from "react";
import { updateAdsOptInAction, updateRegionAction } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";

const REGIONS = [
  { code: "IN", label: "India" },
  { code: "SG", label: "Singapore" },
  { code: "AE", label: "United Arab Emirates" },
] as const;

export function SettingsForm({ region, adsOptIn }: { region: string; adsOptIn: boolean }) {
  const [selectedRegion, setSelectedRegion] = useState(region);
  const [optIn, setOptIn] = useState(adsOptIn);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-8">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const r = await updateRegionAction(selectedRegion);
            setMessage(r.success ? "Region updated" : r.error ?? "");
          });
        }}
      >
        <h2 className="font-semibold">Region</h2>
        <select
          className="w-full rounded-lg border px-3 py-2 text-sm"
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
        >
          {REGIONS.map((r) => (
            <option key={r.code} value={r.code}>
              {r.label}
            </option>
          ))}
        </select>
        <Button type="submit" disabled={isPending}>
          Save region
        </Button>
      </form>

      <form
        className="space-y-3 border-t pt-6"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const r = await updateAdsOptInAction(optIn);
            setMessage(r.success ? "Ads preference saved" : r.error ?? "");
          });
        }}
      >
        <h2 className="font-semibold">Publisher ads</h2>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} />
          Opt in to ALINKS ad network slots on my public site (Basic/Free tiers)
        </label>
        <Button type="submit" disabled={isPending}>
          Save ads preference
        </Button>
      </form>

      {message && <p className="text-sm text-slate-700">{message}</p>}
    </div>
  );
}