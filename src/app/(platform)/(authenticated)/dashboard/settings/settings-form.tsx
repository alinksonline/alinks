"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteAccountAction,
  exportTenantDataAction,
  updateAdsOptInAction,
  updateRegionAction,
  withdrawOptionalConsentAction,
} from "@/app/actions/settings";
import { SettingsSection } from "@/components/platform/settings-section";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import Link from "next/link";

const REGIONS = [
  { code: "IN", label: "India" },
  { code: "SG", label: "Singapore" },
  { code: "AE", label: "United Arab Emirates" },
] as const;

/** Region, ads, export, delete — ordered blocks (sheet is a separate section on the page). */
export function SettingsForm({ region, adsOptIn }: { region: string; adsOptIn: boolean }) {
  const router = useRouter();
  const [selectedRegion, setSelectedRegion] = useState(region);
  const [optIn, setOptIn] = useState(adsOptIn);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <SettingsSection
        step="03 · Preferences"
        title="Region"
        description="Used for defaults (currency display, local copy). Does not change your ALINKS plan."
      >
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(async () => {
              const r = await updateRegionAction(selectedRegion);
              if (r.success) toast.success("Region saved");
              else toast.error(r.error ?? "Could not save region");
            });
          }}
        >
          <select
            className="premium-input text-sm"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            {REGIONS.map((r) => (
              <option key={r.code} value={r.code}>
                {r.label}
              </option>
            ))}
          </select>
          <Button type="submit" variant="secondary" disabled={isPending}>
            Save region
          </Button>
        </form>
      </SettingsSection>

      <SettingsSection
        step="04 · Preferences"
        title="Publisher ads"
        description="Optional ALINKS ad slots on your public site (Basic tiers)."
      >
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(async () => {
              const r = await updateAdsOptInAction(optIn);
              if (r.success) toast.success("Ads preference saved");
              else toast.error(r.error ?? "Could not save preference");
            });
          }}
        >
          <label className="flex items-start gap-2 text-sm text-brand-ink">
            <input
              type="checkbox"
              checked={optIn}
              onChange={(e) => setOptIn(e.target.checked)}
              className="mt-0.5"
            />
            <span>Opt in to publisher ads on my mini-site</span>
          </label>
          <Button type="submit" variant="secondary" disabled={isPending}>
            Save ads preference
          </Button>
        </form>
      </SettingsSection>

      <SettingsSection
        step="05 · Account"
        title="Export my data"
        description="Download platform account and business config as JSON. Does not include customer rows in your Google Sheet."
      >
        <Button
          type="button"
          variant="secondary"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const r = await exportTenantDataAction();
              if (!r.success || !r.json) {
                toast.error(r.error ?? "Export failed");
                return;
              }
              const blob = new Blob([r.json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `alinks-export-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success("Export downloaded");
            })
          }
        >
          Download export
        </Button>
      </SettingsSection>

      <SettingsSection
        step="06 · Privacy"
        title="Privacy & consent"
        description="Withdraw optional processing (publisher ads). Account, security, and billing processing continue until you delete your account."
      >
        <p className="text-sm text-brand-ink/70">
          Current publisher ads opt-in:{" "}
          <span className="font-semibold text-brand-ink">{optIn ? "On" : "Off"}</span>
        </p>
        <Button
          type="button"
          variant="secondary"
          disabled={isPending || !optIn}
          onClick={() =>
            startTransition(async () => {
              const r = await withdrawOptionalConsentAction();
              if (!r.success) {
                toast.error(r.error ?? "Could not withdraw consent");
                return;
              }
              setOptIn(false);
              toast.success("Optional consent withdrawn", "Publisher ads are off.");
            })
          }
        >
          Withdraw optional consent
        </Button>
        <p className="text-[12px] leading-relaxed text-brand-muted">
          For access/correction requests or other rights, see{" "}
          <Link href="/grievance" className="font-semibold text-brand-turquoise underline">
            Grievance
          </Link>
          ,{" "}
          <Link href="/privacy" className="font-semibold text-brand-turquoise underline">
            Privacy
          </Link>
          , and{" "}
          <Link href="/cookies" className="font-semibold text-brand-turquoise underline">
            Cookies
          </Link>
          .
        </p>
      </SettingsSection>

      <SettingsSection
        step="07 · Danger zone"
        title="Delete account"
        description="Permanently remove your ALINKS account and site config on our platform. Customer data in your own Sheet is not deleted by Artix."
        variant="danger"
      >
        <label className="block text-[10px] font-semibold uppercase tracking-wide text-brand-muted">
          Type DELETE to confirm
        </label>
        <input
          className="premium-input font-mono text-sm"
          value={deleteConfirm}
          onChange={(e) => setDeleteConfirm(e.target.value)}
          placeholder="DELETE"
          autoComplete="off"
        />
        <Button
          type="button"
          variant="secondary"
          disabled={isPending || deleteConfirm !== "DELETE"}
          className="!border-red-400/40 !text-red-800 dark:!text-red-200"
          onClick={() =>
            startTransition(async () => {
              const r = await deleteAccountAction(deleteConfirm);
              if (!r.success) {
                toast.error(r.error ?? "Could not delete account");
                return;
              }
              toast.info("Account deleted");
              router.push("/login");
              router.refresh();
            })
          }
        >
          {isPending ? "Deleting…" : "Delete my account"}
        </Button>
      </SettingsSection>
    </>
  );
}
