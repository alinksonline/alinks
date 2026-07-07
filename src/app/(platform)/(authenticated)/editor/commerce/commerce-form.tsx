"use client";

import { useState, useTransition } from "react";
import { connectGoogleSheetAction } from "@/app/actions/business";
import { enableProCheckoutAction, updateCodSettingAction } from "@/app/actions/commerce";
import { Button } from "@/components/ui/button";

export function CommerceForm({
  businessId,
  spreadsheetId,
  checkoutMode,
  codEnabled,
  tier,
}: {
  businessId: string;
  spreadsheetId: string;
  checkoutMode: string;
  codEnabled: boolean;
  tier: string;
}) {
  const [sheetId, setSheetId] = useState(spreadsheetId);
  const [cod, setCod] = useState(codEnabled);
  const [acceptPayment, setAcceptPayment] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const isPro = tier === "pro" || tier === "enterprise";

  return (
    <div className="space-y-8">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const result = await connectGoogleSheetAction(businessId, sheetId);
            setMessage(result.success ? "Sheet connected (dev mode writes to .data/tenant-sheets/)" : result.error ?? "");
          });
        }}
      >
        <h2 className="font-semibold">Google Sheets</h2>
        <input
          className="w-full rounded-lg border px-3 py-2 font-mono text-sm"
          placeholder="Spreadsheet ID or dev-sheet-demo"
          value={sheetId}
          onChange={(e) => setSheetId(e.target.value)}
        />
        <p className="text-xs text-slate-500">Orders and bookings append to tenant sheet. Local dev uses file storage.</p>
        <Button type="submit" disabled={isPending}>
          Save sheet connection
        </Button>
      </form>

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