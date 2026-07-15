"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  connectGoogleSheetAction,
  provisionGoogleSheetAction,
} from "@/app/actions/business";
import { enableProCheckoutAction, updateCodSettingAction } from "@/app/actions/commerce";
import { Button } from "@/components/ui/button";
import { cn } from "@/core/utils/cn";

export function CommerceForm({
  businessId,
  spreadsheetId,
  checkoutMode,
  codEnabled,
  tier,
  storageKind,
  googleConfigured,
  serviceAccountEmail,
  vertical = "general",
}: {
  businessId: string;
  spreadsheetId: string;
  checkoutMode: string;
  codEnabled: boolean;
  tier: string;
  storageKind: string;
  googleConfigured: boolean;
  serviceAccountEmail: string | null;
  vertical?: string;
}) {
  const [sheetId, setSheetId] = useState(spreadsheetId === "dev-sheet-demo" ? "" : spreadsheetId);
  const [cod, setCod] = useState(codEnabled);
  const [acceptPayment, setAcceptPayment] = useState(false);
  const [acceptData, setAcceptData] = useState(false);
  const [message, setMessage] = useState("");
  const [messageOk, setMessageOk] = useState(false);
  const [sheetUrl, setSheetUrl] = useState(
    spreadsheetId && !spreadsheetId.startsWith("dev-")
      ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}`
      : "",
  );
  const [isPending, startTransition] = useTransition();

  const isPro = tier === "pro" || tier === "enterprise";
  const liveSheet = Boolean(spreadsheetId && !spreadsheetId.startsWith("dev-"));
  const proCheckoutOn = checkoutMode === "pro";
  const isSalon = vertical === "salon" || vertical === "beauty";

  function flash(text: string, ok = false) {
    setMessage(text);
    setMessageOk(ok);
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Status strip */}
      <div className="premium-card grid grid-cols-2 gap-2 p-3 sm:grid-cols-3">
        <StatusPill
          label="Plan"
          value={isPro ? tier : "basic"}
          tone={isPro ? "ok" : "warn"}
        />
        <StatusPill
          label="Checkout"
          value={proCheckoutOn ? "On-site pay" : "WhatsApp only"}
          tone={proCheckoutOn ? "ok" : "muted"}
        />
        <StatusPill
          label="COD"
          value={!proCheckoutOn ? "—" : cod ? "On" : "Off"}
          tone={!proCheckoutOn ? "muted" : cod ? "ok" : "muted"}
          className="col-span-2 sm:col-span-1"
        />
      </div>

      {isSalon ? (
        <div className="rounded-xl border border-brand-purple/20 bg-brand-purple/10 px-3 py-2.5 text-[12px] leading-snug text-brand-ink">
          <span className="font-semibold">Salon tip: </span>
          What customers book lives under{" "}
          <Link href="/editor/packages" className="font-semibold text-brand-purple underline">
            Packages
          </Link>
          . <strong>Payments</strong> is only how they pay (UPI, card, COD) and where orders are saved.
        </div>
      ) : null}

      {/* 1. Orders sheet */}
      <section className="premium-card space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-brand-ink">1. Orders sheet</h2>
            <p className="mt-0.5 text-[11px] leading-snug text-brand-muted">
              Orders & bookings go to <strong>your</strong> Google Sheet — not ALINKS DB.
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
              liveSheet
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : "bg-amber-500/15 text-amber-800 dark:text-amber-200",
            )}
          >
            {liveSheet ? "Connected" : "Needed"}
          </span>
        </div>

        <p className="font-mono text-[10px] text-brand-muted">
          backend={storageKind}
          {serviceAccountEmail ? ` · sa=${serviceAccountEmail}` : ""}
        </p>

        {!googleConfigured ? (
          <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-900 dark:text-amber-100">
            Dev/file mode (no Google SA on server). Data may land under <code>.data/tenant-sheets/</code> until
            production Google is configured.
          </div>
        ) : null}

        <label className="flex items-start gap-2 text-[12px] text-brand-ink">
          <input
            type="checkbox"
            checked={acceptData}
            onChange={(e) => setAcceptData(e.target.checked)}
            className="mt-0.5"
          />
          <span>I own this customer data — it is stored in my sheet, not Artix.</span>
        </label>

        <Button
          type="button"
          variant="bronze"
          disabled={isPending || !acceptData || !googleConfigured}
          onClick={() =>
            startTransition(async () => {
              const result = await provisionGoogleSheetAction(businessId, acceptData);
              if (!result.success) {
                flash(result.error ?? "Provision failed");
                return;
              }
              setSheetId(result.spreadsheetId);
              setSheetUrl(result.spreadsheetUrl);
              flash("New Google Sheet created and connected.", true);
            })
          }
        >
          {isPending ? "Working…" : "Create Google Sheet"}
        </Button>

        <form
          className="space-y-2 border-t border-brand-ink/8 pt-3"
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
              flash(
                googleConfigured
                  ? "Sheet connected. Orders will append here."
                  : "Sheet ID saved (server still in dev file mode).",
                true,
              );
            });
          }}
        >
          <p className="text-[11px] font-semibold text-brand-ink">Or paste existing sheet</p>
          <input
            className="premium-input font-mono text-xs"
            placeholder="Spreadsheet ID or full Google Sheets URL"
            value={sheetId}
            onChange={(e) => setSheetId(e.target.value)}
          />
          <Button type="submit" variant="secondary" disabled={isPending || !acceptData}>
            Save connection
          </Button>
        </form>

        {sheetUrl ? (
          <a
            href={sheetUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-[12px] font-semibold text-brand-purple underline"
          >
            Open my orders sheet →
          </a>
        ) : null}
      </section>

      {/* 2. On-site checkout */}
      <section className="premium-card space-y-3 p-4">
        <div>
          <h2 className="text-sm font-bold text-brand-ink">2. On-site checkout</h2>
          <p className="mt-0.5 text-[11px] leading-snug text-brand-muted">
            UPI & cards via ALINKS payment facilitation (Artix partner). You are seller of record — no
            pasting API keys.
          </p>
        </div>

        {!isPro ? (
          <div className="rounded-lg border border-brand-ink/10 bg-brand-mist/60 px-3 py-3 text-[12px] text-brand-ink">
            <p className="font-semibold">Pro required</p>
            <p className="mt-1 text-brand-muted">
              Basic stays on WhatsApp ordering. Upgrade to Pro to take UPI / card on your mini-site.
            </p>
            <Link href="/billing" className="mt-2 inline-block text-[12px] font-bold text-brand-purple underline">
              View plans →
            </Link>
          </div>
        ) : proCheckoutOn ? (
          <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2.5 text-[12px] text-emerald-900 dark:text-emerald-100">
            <p className="font-bold">Pro checkout is on</p>
            <p className="mt-0.5 opacity-90">
              Customers can pay online on your site. Bank KYC / sub-merchant activation is handled through
              ALINKS (partner stack) — not a separate key paste.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="flex items-start gap-2 text-[12px] text-brand-ink">
              <input
                type="checkbox"
                checked={acceptPayment}
                onChange={(e) => setAcceptPayment(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                I accept the <strong>Payment Facilitation Addendum</strong> — Artix routes pay; I sell the
                goods/services.
              </span>
            </label>
            <Button
              type="button"
              variant="bronze"
              disabled={isPending || !acceptPayment}
              onClick={() =>
                startTransition(async () => {
                  const result = await enableProCheckoutAction(businessId, acceptPayment);
                  flash(result.success ? "Pro checkout enabled." : result.error ?? "Failed", result.success);
                })
              }
            >
              Enable on-site payments
            </Button>
          </div>
        )}
      </section>

      {/* 3. COD */}
      <section className="premium-card space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-brand-ink">3. Cash on delivery</h2>
            <p className="mt-0.5 text-[11px] leading-snug text-brand-muted">
              Default ON for Indian shops (Q020). Risk is yours — fake orders, no-shows, cash handling.
            </p>
          </div>
        </div>

        {!isPro || !proCheckoutOn ? (
          <p className="text-[11px] text-brand-muted">
            Turn on Pro checkout first to show COD as a payment method on your site.
          </p>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              const next = !cod;
              setCod(next);
              startTransition(async () => {
                await updateCodSettingAction(businessId, next);
                flash(next ? "COD enabled." : "COD disabled.", true);
              });
            }}
            className={cn(
              "flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition",
              cod
                ? "border-brand-turquoise/40 bg-brand-turquoise/10"
                : "border-brand-ink/10 bg-brand-mist/40",
            )}
          >
            <div>
              <p className="text-sm font-bold text-brand-ink">Accept cash on delivery</p>
              <p className="mt-0.5 text-[11px] text-brand-muted">
                {cod ? "Shown at checkout · no payment gateway" : "Hidden from checkout"}
              </p>
            </div>
            <span
              className={cn(
                "flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition",
                cod ? "bg-brand-turquoise" : "bg-brand-ink/20",
              )}
              aria-hidden
            >
              <span
                className={cn(
                  "h-6 w-6 rounded-full bg-white shadow transition",
                  cod ? "translate-x-5" : "translate-x-0",
                )}
              />
            </span>
          </button>
        )}
      </section>

      {message ? (
        <p
          className={cn(
            "rounded-xl border px-3 py-2 text-[12px]",
            messageOk
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100"
              : "border-brand-ink/10 bg-brand-mist text-brand-ink",
          )}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

function StatusPill({
  label,
  value,
  tone,
  className,
}: {
  label: string;
  value: string;
  tone: "ok" | "warn" | "muted";
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-brand-ink/8 bg-brand-mist/50 px-2.5 py-2", className)}>
      <p className="font-mono text-[9px] uppercase tracking-wider text-brand-muted">{label}</p>
      <p
        className={cn(
          "mt-0.5 truncate text-[11px] font-bold capitalize",
          tone === "ok" && "text-emerald-700 dark:text-emerald-300",
          tone === "warn" && "text-amber-800 dark:text-amber-200",
          tone === "muted" && "text-brand-ink",
        )}
      >
        {value}
      </p>
    </div>
  );
}
