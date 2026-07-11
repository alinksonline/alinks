"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteAccountAction,
  exportTenantDataAction,
  updateAdsOptInAction,
  updateRegionAction,
} from "@/app/actions/settings";
import { Button } from "@/components/ui/button";

const REGIONS = [
  { code: "IN", label: "India" },
  { code: "SG", label: "Singapore" },
  { code: "AE", label: "United Arab Emirates" },
] as const;

export function SettingsForm({ region, adsOptIn }: { region: string; adsOptIn: boolean }) {
  const router = useRouter();
  const [selectedRegion, setSelectedRegion] = useState(region);
  const [optIn, setOptIn] = useState(adsOptIn);
  const [deleteConfirm, setDeleteConfirm] = useState("");
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

      <section className="space-y-3 border-t pt-6">
        <h2 className="font-semibold">Export my data</h2>
        <p className="text-sm text-brand-ink/60">
          Download a JSON copy of your platform account and business settings. Does not include customer data in your
          Sheet or Supabase.
        </p>
        <Button
          type="button"
          variant="secondary"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const r = await exportTenantDataAction();
              if (!r.success || !r.json) {
                setMessage(r.error ?? "Export failed");
                return;
              }
              const blob = new Blob([r.json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `alinks-export-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
              setMessage("Export downloaded");
            })
          }
        >
          Export my data
        </Button>
      </section>

      <section className="space-y-3 border-t border-red-200 pt-6">
        <h2 className="font-semibold text-red-800">Delete account</h2>
        <p className="text-sm text-brand-ink/60">
          Permanently delete your ALINKS tenant account, businesses, and site configuration on our platform.
          Customer data in your Google Sheet or Supabase is not deleted by Artix — remove it in your own storage.
          Billing records may be retained as required by law.
        </p>
        <label className="block text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
          Type DELETE to confirm
        </label>
        <input
          className="w-full rounded-lg border border-red-200 px-3 py-2 font-mono text-sm"
          value={deleteConfirm}
          onChange={(e) => setDeleteConfirm(e.target.value)}
          placeholder="DELETE"
          autoComplete="off"
        />
        <Button
          type="button"
          variant="secondary"
          disabled={isPending || deleteConfirm !== "DELETE"}
          className="border-red-300 text-red-800 hover:bg-red-50"
          onClick={() =>
            startTransition(async () => {
              const r = await deleteAccountAction(deleteConfirm);
              if (!r.success) {
                setMessage(r.error ?? "Could not delete account");
                return;
              }
              router.push("/login");
              router.refresh();
            })
          }
        >
          {isPending ? "Deleting…" : "Delete my account"}
        </Button>
      </section>

      {message && <p className="text-sm text-slate-700">{message}</p>}
    </div>
  );
}