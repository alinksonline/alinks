"use client";

import { useState, useTransition } from "react";
import { provisionGoogleSheetAction } from "@/app/actions/business";
import { SettingsSection } from "@/components/platform/settings-section";
import { Button } from "@/components/ui/button";
import { cn } from "@/core/utils/cn";

/**
 * A · Google Sheets — one-tap create under ALINKS helper SA.
 * Own-sheet connect lives in “Your own Google Cloud” (B).
 */
export function OrdersSheetForm({
  businessId,
  spreadsheetId,
  googleConfigured,
}: {
  businessId: string;
  spreadsheetId: string;
  googleConfigured: boolean;
  serviceAccountEmail?: string | null;
  stepLabel?: string;
}) {
  const [acceptData, setAcceptData] = useState(false);
  const [message, setMessage] = useState("");
  const [messageOk, setMessageOk] = useState(false);
  const [sheetUrl, setSheetUrl] = useState(
    spreadsheetId && !spreadsheetId.startsWith("dev-")
      ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}`
      : "",
  );
  const [isPending, startTransition] = useTransition();
  const liveSheet = Boolean(spreadsheetId && !spreadsheetId.startsWith("dev-"));

  return (
    <SettingsSection
      step="A · Google Sheets"
      title="Google Sheets"
      description="Easiest path. We create a workbook for this business. Orders and bookings land there — free for you."
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
              setMessage(result.error ?? "Could not create sheet");
              setMessageOk(false);
              return;
            }
            setSheetUrl(result.spreadsheetUrl);
            setMessage("Google Sheet created and connected.");
            setMessageOk(true);
          })
        }
      >
        {isPending ? "Working…" : "Create Google Sheet for me"}
      </Button>

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
