"use client";

import { useState, useTransition } from "react";
import {
  connectGoogleSheetAction,
  provisionGoogleSheetAction,
} from "@/app/actions/business";
import { SettingsSection } from "@/components/platform/settings-section";
import { Button } from "@/components/ui/button";
import { cn } from "@/core/utils/cn";

/**
 * Tenant data storage — Settings only (not Checkout).
 */
export function OrdersSheetForm({
  businessId,
  spreadsheetId,
  googleConfigured,
  serviceAccountEmail,
}: {
  businessId: string;
  spreadsheetId: string;
  googleConfigured: boolean;
  serviceAccountEmail: string | null;
}) {
  const [sheetId, setSheetId] = useState(spreadsheetId === "dev-sheet-demo" ? "" : spreadsheetId);
  const [acceptData, setAcceptData] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [message, setMessage] = useState("");
  const [messageOk, setMessageOk] = useState(false);
  const [sheetUrl, setSheetUrl] = useState(
    spreadsheetId && !spreadsheetId.startsWith("dev-")
      ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}`
      : "",
  );
  const [isPending, startTransition] = useTransition();
  const liveSheet = Boolean(spreadsheetId && !spreadsheetId.startsWith("dev-"));

  function flash(text: string, ok = false) {
    setMessage(text);
    setMessageOk(ok);
  }

  return (
    <SettingsSection
      step="01 · Data"
      title="Orders & bookings sheet"
      description="Customer orders and bookings are written to your Google Sheet — not the ALINKS platform database."
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] text-brand-muted">Status</span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
            liveSheet
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              : "bg-amber-500/15 text-amber-800 dark:text-amber-200",
          )}
        >
          {liveSheet ? "Connected" : "Not set"}
        </span>
      </div>

      <label className="flex items-start gap-2 text-sm text-brand-ink">
        <input
          type="checkbox"
          checked={acceptData}
          onChange={(e) => setAcceptData(e.target.checked)}
          className="mt-0.5"
        />
        <span>I understand orders will be stored in my Google Sheet (I own that data).</span>
      </label>

      <Button
        type="button"
        variant="bronze"
        disabled={isPending || !acceptData || !googleConfigured}
        onClick={() =>
          startTransition(async () => {
            const result = await provisionGoogleSheetAction(businessId, acceptData);
            if (!result.success) {
              flash(result.error ?? "Could not create sheet");
              return;
            }
            setSheetId(result.spreadsheetId);
            setSheetUrl(result.spreadsheetUrl);
            flash("Google Sheet created and connected.", true);
          })
        }
      >
        {isPending ? "Working…" : "Create Google Sheet for me"}
      </Button>

      <button
        type="button"
        className="text-xs font-semibold text-brand-purple underline"
        onClick={() => setShowAdvanced((v) => !v)}
      >
        {showAdvanced ? "Hide advanced" : "Use my own spreadsheet"}
      </button>

      {showAdvanced ? (
        <form
          className="space-y-2 rounded-xl border border-brand-ink/10 bg-brand-mist/40 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(async () => {
              if (!acceptData) {
                flash("Confirm the data ownership checkbox first");
                return;
              }
              const result = await connectGoogleSheetAction(businessId, sheetId);
              if (!result.success) {
                flash(result.error ?? "Connect failed");
                return;
              }
              setSheetId(result.spreadsheetId);
              setSheetUrl(result.spreadsheetUrl);
              flash("Sheet connected.", true);
            });
          }}
        >
          {serviceAccountEmail ? (
            <p className="text-[11px] leading-relaxed text-brand-muted">
              Share that spreadsheet as <strong>Editor</strong> with:
              <code className="mt-1 block break-all text-[10px] text-brand-ink">{serviceAccountEmail}</code>
            </p>
          ) : null}
          <input
            className="premium-input font-mono text-xs"
            placeholder="Spreadsheet URL or ID"
            value={sheetId}
            onChange={(e) => setSheetId(e.target.value)}
          />
          <Button type="submit" variant="secondary" disabled={isPending || !acceptData}>
            Save sheet
          </Button>
        </form>
      ) : null}

      {sheetUrl ? (
        <a
          href={sheetUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block text-sm font-semibold text-brand-purple underline"
        >
          Open my orders sheet →
        </a>
      ) : null}

      {message ? (
        <p
          className={cn(
            "rounded-lg border px-3 py-2 text-xs",
            messageOk
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100"
              : "border-brand-ink/10 bg-brand-mist text-brand-ink",
          )}
        >
          {message}
        </p>
      ) : null}
    </SettingsSection>
  );
}
