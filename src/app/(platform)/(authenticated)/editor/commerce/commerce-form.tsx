"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  connectTenantRazorpayAction,
  disconnectTenantRazorpayAction,
  enableProCheckoutAction,
  updateCodSettingAction,
} from "@/app/actions/commerce";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { cn } from "@/core/utils/cn";

/**
 * Tenant Checkout: shop connects THEIR Razorpay.
 * ALINKS does not take their sales money — software only.
 */
export function CommerceForm({
  businessId,
  spreadsheetId,
  checkoutMode,
  codEnabled,
  tier,
  vertical = "general",
  razorpayConnected,
  razorpayKeyId,
}: {
  businessId: string;
  spreadsheetId: string;
  checkoutMode: string;
  codEnabled: boolean;
  tier: string;
  vertical?: string;
  razorpayConnected: boolean;
  razorpayKeyId: string | null;
}) {
  const [cod, setCod] = useState(codEnabled);
  const [acceptOwn, setAcceptOwn] = useState(false);
  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [message, setMessage] = useState("");
  const [messageOk, setMessageOk] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [connected, setConnected] = useState(razorpayConnected);
  const [maskedKey, setMaskedKey] = useState(razorpayKeyId);

  const isPro = tier === "pro" || tier === "enterprise";
  const liveSheet = Boolean(spreadsheetId && !spreadsheetId.startsWith("dev-"));
  const proCheckoutOn = checkoutMode === "pro";
  const isSalon = vertical === "salon" || vertical === "beauty";

  function flash(text: string, ok = false) {
    setMessage(text);
    setMessageOk(ok);
    if (ok) toast.success(text);
    else toast.error(text);
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="premium-card grid grid-cols-2 gap-2 p-3 sm:grid-cols-3">
        <StatusPill
          label="Razorpay"
          value={connected ? "Connected" : "Not set"}
          tone={connected ? "ok" : "warn"}
        />
        <StatusPill
          label="Checkout"
          value={proCheckoutOn ? "On" : "Off"}
          tone={proCheckoutOn ? "ok" : "muted"}
        />
        <StatusPill
          label="COD"
          value={!proCheckoutOn ? "—" : cod ? "On" : "Off"}
          tone={!proCheckoutOn ? "muted" : cod ? "ok" : "muted"}
          className="col-span-2 sm:col-span-1"
        />
      </div>

      <p className="text-[12px] leading-snug text-brand-muted">
        Your sales · your Razorpay · your bank. ALINKS is only the website software — we do not take
        customer payments for you.
      </p>

      {isSalon ? (
        <p className="text-[12px] leading-snug text-brand-muted">
          Connect Razorpay here to enable <strong>pay-then-book</strong> on individual packages (15-minute soft
          hold). Free and pay-at-salon packages work without a gateway. Manage modes under{" "}
          <Link href="/editor/packages" className="font-semibold text-brand-purple underline">
            Packages
          </Link>
          .
        </p>
      ) : null}

      {!liveSheet ? (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-[12px] text-amber-950 dark:text-amber-100">
          <p className="font-semibold">Orders sheet not connected</p>
          <p className="mt-0.5 opacity-90">Connect under Data so paid orders land in your workbook.</p>
          <Link href="/dashboard/data" className="mt-2 inline-block font-bold text-brand-purple underline">
            Open Data →
          </Link>
        </div>
      ) : null}

      {/* 1. Connect own Razorpay */}
      <section className="premium-card space-y-3 p-4">
        <div>
          <h2 className="text-sm font-bold text-brand-ink">1. Your Razorpay</h2>
          <p className="mt-0.5 text-[11px] leading-snug text-brand-muted">
            Create a free account at razorpay.com → Settings → API Keys. Paste <strong>your</strong> keys
            here. Settlement goes to <strong>your</strong> bank.
          </p>
        </div>

        {!isPro ? (
          <div className="rounded-lg border border-brand-ink/10 bg-brand-mist/60 px-3 py-3 text-[12px]">
            <p className="font-semibold text-brand-ink">Pro required to take online pay</p>
            <p className="mt-1 text-brand-muted">Upgrade under Billing (bottom tab) — not on this page.</p>
            <Link href="/billing" className="mt-2 inline-block font-bold text-brand-purple underline">
              Open Billing →
            </Link>
          </div>
        ) : connected ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2.5 text-[12px] text-emerald-900 dark:text-emerald-100">
              <p className="font-bold">Razorpay connected</p>
              <p className="mt-0.5 font-mono text-[11px] opacity-90">Key ID: {maskedKey}</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const r = await disconnectTenantRazorpayAction(businessId);
                  if (r.success) {
                    setConnected(false);
                    setMaskedKey(null);
                    flash("Razorpay disconnected.", true);
                  } else flash(r.error ?? "Failed");
                })
              }
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="t-input-group">
              <label className="text-[11px] font-semibold text-brand-muted" htmlFor="rzp-key">
                Key ID
              </label>
              <input
                id="rzp-key"
                className="premium-input font-mono text-xs"
                placeholder="rzp_live_… or rzp_test_…"
                value={keyId}
                onChange={(e) => setKeyId(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="t-input-group">
              <label className="text-[11px] font-semibold text-brand-muted" htmlFor="rzp-secret">
                Key Secret
              </label>
              <input
                id="rzp-secret"
                type="password"
                className="premium-input font-mono text-xs"
                placeholder="Never shared in the browser after save"
                value={keySecret}
                onChange={(e) => setKeySecret(e.target.value)}
                autoComplete="off"
              />
            </div>
            <label className="flex items-start gap-2 text-[12px] text-brand-ink">
              <input
                type="checkbox"
                checked={acceptOwn}
                onChange={(e) => setAcceptOwn(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                I understand payments go to <strong>my</strong> Razorpay account. ALINKS does not collect or
                settle my customer sales.
              </span>
            </label>
            <Button
              type="button"
              variant="bronze"
              disabled={isPending || !acceptOwn || !keyId || !keySecret}
              onClick={() =>
                startTransition(async () => {
                  const r = await connectTenantRazorpayAction(businessId, keyId, keySecret);
                  if (r.success) {
                    setConnected(true);
                    setMaskedKey(keyId.trim());
                    setKeySecret("");
                    flash("Razorpay connected. Online checkout is ready.", true);
                  } else flash(r.error ?? "Failed");
                })
              }
            >
              {isPending ? "Verifying…" : "Connect Razorpay"}
            </Button>
          </div>
        )}
      </section>

      {/* 2. Checkout mode + COD */}
      <section className="premium-card space-y-3 p-4">
        <div>
          <h2 className="text-sm font-bold text-brand-ink">2. Checkout options</h2>
          <p className="mt-0.5 text-[11px] leading-snug text-brand-muted">
            Turn on mini-site checkout and cash on delivery. Online UPI/card needs Razorpay above.
          </p>
        </div>

        {!isPro ? (
          <p className="text-[11px] text-brand-muted">Pro plan required for on-site checkout.</p>
        ) : !proCheckoutOn ? (
          <div className="space-y-2">
            <Button
              type="button"
              variant="bronze"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const r = await enableProCheckoutAction(businessId, true);
                  flash(r.success ? "Checkout mode on." : r.error ?? "Failed", r.success);
                })
              }
            >
              Enable on-site checkout
            </Button>
          </div>
        ) : (
          <p className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-300">
            On-site checkout is enabled
            {connected ? " · UPI/card via your Razorpay" : " · connect Razorpay for UPI/card"}
          </p>
        )}

        {isPro && proCheckoutOn ? (
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
              <p className="text-sm font-bold text-brand-ink">Cash on delivery</p>
              <p className="mt-0.5 text-[11px] text-brand-muted">
                {cod ? "Shown at checkout · no gateway" : "Hidden"}
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
        ) : null}
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
