"use client";

import { useState, useTransition } from "react";
import {
  connectGoogleSheetAction,
  provisionGoogleSheetAction,
} from "@/app/actions/business";
import { enableProCheckoutAction, updateCodSettingAction } from "@/app/actions/commerce";
import { Button } from "@/components/ui/button";

export function CommerceForm({
  businessId,
  spreadsheetId,
  checkoutMode,
  codEnabled,
  tier,
  storageKind,
  googleConfigured,
  serviceAccountEmail,
}: {
  businessId: string;
  spreadsheetId: string;
  checkoutMode: string;
  codEnabled: boolean;
  tier: string;
  storageKind: string;
  googleConfigured: boolean;
  serviceAccountEmail: string | null;
}) {
  const [sheetId, setSheetId] = useState(spreadsheetId === "dev-sheet-demo" ? "" : spreadsheetId);
  const [cod, setCod] = useState(codEnabled);
  const [acceptPayment, setAcceptPayment] = useState(false);
  const [acceptData, setAcceptData] = useState(false);
  const [message, setMessage] = useState("");
  const [sheetUrl, setSheetUrl] = useState(
    spreadsheetId && !spreadsheetId.startsWith("dev-")
      ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}`
      : "",
  );
  const [isPending, startTransition] = useTransition();

  const isPro = tier === "pro" || tier === "enterprise";
  const liveSheet = Boolean(spreadsheetId && !spreadsheetId.startsWith("dev-"));

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="font-semibold">Customer data storage (Google Sheets)</h2>
        <p className="text-sm text-slate-600">
          Orders, bookings, customers, and patients are written to <strong>your</strong> Google Sheet — not Artix
          platform database. Backend: <code className="rounded bg-slate-100 px-1 text-xs">{storageKind}</code>
          {liveSheet ? " · connected" : " · not connected to a live Sheet yet"}
        </p>

        {googleConfigured ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-sm text-emerald-900">
            Google service account ready
            {serviceAccountEmail ? (
              <>
                {" "}
                (<code className="text-xs">{serviceAccountEmail}</code>
              </>
            ) : null}
            . Share existing sheets with this email as <strong>Editor</strong>, or create a new workbook below.
          </div>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Server is in local/dev file mode (no <code>GOOGLE_SERVICE_ACCOUNT_JSON</code>). Data is stored under{" "}
            <code>.data/tenant-sheets/</code> until Google is configured on Vercel.
          </div>
        )}

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={acceptData} onChange={(e) => setAcceptData(e.target.checked)} className="mt-0.5" />
          I understand customer/order/booking data will be stored in Google Sheets for my business (I own that data).
        </label>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="bronze"
            disabled={isPending || !acceptData || !googleConfigured}
            onClick={() =>
              startTransition(async () => {
                const result = await provisionGoogleSheetAction(businessId, acceptData);
                if (!result.success) {
                  setMessage(result.error ?? "Provision failed");
                  return;
                }
                setSheetId(result.spreadsheetId);
                setSheetUrl(result.spreadsheetUrl);
                setMessage("New Google Sheet created and connected. Check your email for access.");
              })
            }
          >
            {isPending ? "Working…" : "Create Google Sheet for my business"}
          </Button>
        </div>

        <form
          className="space-y-3 border-t pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(async () => {
              if (!acceptData) {
                setMessage("Confirm the data ownership checkbox first");
                return;
              }
              const result = await connectGoogleSheetAction(businessId, sheetId);
              if (!result.success) {
                setMessage(result.error ?? "Connect failed");
                return;
              }
              setSheetId(result.spreadsheetId);
              setSheetUrl(result.spreadsheetUrl);
              setMessage(
                googleConfigured
                  ? "Google Sheet connected. Orders and bookings will append here."
                  : "Sheet ID saved. Server is still in dev file mode until GOOGLE_SERVICE_ACCOUNT_JSON is set.",
              );
            });
          }}
        >
          <h3 className="text-sm font-semibold">Or link an existing spreadsheet</h3>
          <input
            className="w-full rounded-lg border px-3 py-2 font-mono text-sm"
            placeholder="Spreadsheet ID or https://docs.google.com/spreadsheets/d/…"
            value={sheetId}
            onChange={(e) => setSheetId(e.target.value)}
          />
          <Button type="submit" disabled={isPending || !acceptData}>
            Save sheet connection
          </Button>
        </form>

        {sheetUrl && (
          <p className="text-sm">
            Open sheet:{" "}
            <a href={sheetUrl} target="_blank" rel="noreferrer" className="font-medium text-brand-purple underline">
              {sheetUrl}
            </a>
          </p>
        )}
      </section>

      {isPro && (
        <div className="space-y-4 border-t pt-6">
          <h2 className="font-semibold">Pro checkout</h2>
          <p className="text-sm text-slate-600">
            Status: <strong>{checkoutMode === "pro" ? "Enabled" : "Lite (WhatsApp only)"}</strong>
          </p>
          {checkoutMode !== "pro" && (
            <>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={acceptPayment} onChange={(e) => setAcceptPayment(e.target.checked)} />
                I accept the Payment Facilitation Addendum
              </label>
              <Button
                type="button"
                disabled={isPending || !acceptPayment}
                onClick={() =>
                  startTransition(async () => {
                    const result = await enableProCheckoutAction(businessId, acceptPayment);
                    setMessage(result.success ? "Pro checkout enabled" : result.error ?? "");
                  })
                }
              >
                Enable Pro checkout
              </Button>
            </>
          )}
          {checkoutMode === "pro" && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={cod}
                onChange={(e) => {
                  setCod(e.target.checked);
                  startTransition(async () => {
                    await updateCodSettingAction(businessId, e.target.checked);
                  });
                }}
              />
              Cash on delivery (default ON per Q020)
            </label>
          )}
        </div>
      )}

      {message && <p className="text-sm text-slate-700">{message}</p>}
    </div>
  );
}
