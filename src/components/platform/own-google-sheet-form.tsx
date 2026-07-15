"use client";

import { useState, useTransition } from "react";
import { connectGoogleSheetAction } from "@/app/actions/business";
import { SettingsSection } from "@/components/platform/settings-section";
import { Button } from "@/components/ui/button";
import { cn } from "@/core/utils/cn";

/**
 * B · Your own Google Cloud — tenant’s existing spreadsheet in their Drive/Cloud.
 */
export function OwnGoogleSheetForm({
  businessId,
  spreadsheetId,
  serviceAccountEmail,
}: {
  businessId: string;
  spreadsheetId: string;
  serviceAccountEmail: string | null;
}) {
  const [sheetId, setSheetId] = useState(spreadsheetId === "dev-sheet-demo" ? "" : spreadsheetId);
  const [acceptData, setAcceptData] = useState(false);
  const [message, setMessage] = useState("");
  const [messageOk, setMessageOk] = useState(false);
  const [sheetUrl, setSheetUrl] = useState(
    spreadsheetId && !spreadsheetId.startsWith("dev-")
      ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}`
      : "",
  );
  const [isPending, startTransition] = useTransition();

  return (
    <SettingsSection
      step="B · Your own Google Cloud"
      title="Use your own Google"
      description="Already have a sheet in your Google account or Google Workspace? Link it. You keep full control in Drive / Cloud."
    >
      <label className="flex items-start gap-2 text-sm text-brand-ink">
        <input
          type="checkbox"
          checked={acceptData}
          onChange={(e) => setAcceptData(e.target.checked)}
          className="mt-0.5"
        />
        <span>I own this spreadsheet and will store customer order data there.</span>
      </label>

      {serviceAccountEmail ? (
        <p className="text-[11px] leading-relaxed text-brand-muted">
          Share the spreadsheet as <strong>Editor</strong> with this address (required so ALINKS can
          write orders):
          <code className="mt-1 block break-all rounded-lg bg-brand-mist/60 px-2 py-1.5 text-[10px] text-brand-ink">
            {serviceAccountEmail}
          </code>
        </p>
      ) : (
        <p className="text-[11px] text-amber-800 dark:text-amber-200">
          Google service account is not configured on this environment yet. You can still save a sheet
          ID for later.
        </p>
      )}

      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            if (!acceptData) {
              setMessage("Confirm ownership first");
              setMessageOk(false);
              return;
            }
            const result = await connectGoogleSheetAction(businessId, sheetId);
            if (!result.success) {
              setMessage(result.error ?? "Connect failed");
              setMessageOk(false);
              return;
            }
            setSheetId(result.spreadsheetId);
            setSheetUrl(result.spreadsheetUrl);
            setMessage("Your Google Sheet is linked.");
            setMessageOk(true);
          });
        }}
      >
        <label className="text-[11px] font-semibold text-brand-muted" htmlFor="own-sheet">
          Spreadsheet URL or ID
        </label>
        <input
          id="own-sheet"
          className="premium-input font-mono text-xs"
          placeholder="https://docs.google.com/spreadsheets/d/… or sheet ID"
          value={sheetId}
          onChange={(e) => setSheetId(e.target.value)}
        />
        <Button type="submit" variant="bronze" disabled={isPending || !acceptData || !sheetId.trim()}>
          {isPending ? "Saving…" : "Connect my Google Sheet"}
        </Button>
      </form>

      {sheetUrl ? (
        <a
          href={sheetUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block text-sm font-semibold text-brand-purple underline"
        >
          Open linked sheet →
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
