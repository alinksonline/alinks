"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { enableProCheckoutAction, updateCodSettingAction } from "@/app/actions/commerce";
import { Button } from "@/components/ui/button";
import { cn } from "@/core/utils/cn";

/**
 * TENANT Checkout only — how customers pay the shop.
 * Orders Google Sheet lives under Settings (data storage), not here.
 * Platform subscription lives under Billing.
 */
export function CommerceForm({
  businessId,
  spreadsheetId,
  checkoutMode,
  codEnabled,
  tier,
  vertical = "general",
}: {
  businessId: string;
  spreadsheetId: string;
  checkoutMode: string;
  codEnabled: boolean;
  tier: string;
  vertical?: string;
}) {
  const [cod, setCod] = useState(codEnabled);
  const [acceptPayment, setAcceptPayment] = useState(false);
  const [message, setMessage] = useState("");
  const [messageOk, setMessageOk] = useState(false);
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
      <div className="premium-card grid grid-cols-2 gap-2 p-3">
        <StatusPill
          label="Checkout"
          value={proCheckoutOn ? "On-site pay" : "WhatsApp only"}
          tone={proCheckoutOn ? "ok" : "muted"}
        />
        <StatusPill
          label="COD"
          value={!proCheckoutOn ? "—" : cod ? "On" : "Off"}
          tone={!proCheckoutOn ? "muted" : cod ? "ok" : "muted"}
        />
      </div>

      {isSalon ? (
        <p className="text-[12px] leading-snug text-brand-muted">
          What customers buy is under{" "}
          <Link href="/editor/packages" className="font-semibold text-brand-purple underline">
            Packages
          </Link>
          . This page is only how they pay.
        </p>
      ) : null}

      {!liveSheet ? (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-[12px] text-amber-950 dark:text-amber-100">
          <p className="font-semibold">Orders sheet not connected</p>
          <p className="mt-0.5 opacity-90">
            Connect your Google Sheet under Settings so orders land in your workbook.
          </p>
          <Link
            href="/dashboard/settings"
            className="mt-2 inline-block font-bold text-brand-purple underline"
          >
            Open Settings →
          </Link>
        </div>
      ) : null}

      {/* On-site checkout */}
      <section className="premium-card space-y-3 p-4">
        <div>
          <h2 className="text-sm font-bold text-brand-ink">On-site payments</h2>
          <p className="mt-0.5 text-[11px] leading-snug text-brand-muted">
            UPI & cards via ALINKS (partner). You are the seller — no API keys to paste.
          </p>
        </div>

        {!isPro ? (
          <div className="rounded-lg border border-brand-ink/10 bg-brand-mist/60 px-3 py-3 text-[12px] text-brand-ink">
            <p className="font-semibold">On-site UPI / card needs Pro</p>
            <p className="mt-1 text-brand-muted">
              Change your ALINKS subscription in <strong>Billing</strong> (bottom tab).
            </p>
            <Link
              href="/billing"
              className="mt-2 inline-block text-[12px] font-bold text-brand-purple underline"
            >
              Open Billing →
            </Link>
          </div>
        ) : proCheckoutOn ? (
          <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2.5 text-[12px] text-emerald-900 dark:text-emerald-100">
            <p className="font-bold">On-site checkout is on</p>
            <p className="mt-0.5 opacity-90">
              Shoppers can pay online on your mini-site. Bank verification runs through ALINKS when
              partner KYC is available.
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
                I accept the <strong>Payment Facilitation Addendum</strong> — Artix routes pay; I sell
                the goods/services.
              </span>
            </label>
            <Button
              type="button"
              variant="bronze"
              disabled={isPending || !acceptPayment}
              onClick={() =>
                startTransition(async () => {
                  const result = await enableProCheckoutAction(businessId, acceptPayment);
                  flash(
                    result.success ? "On-site checkout enabled." : result.error ?? "Failed",
                    result.success,
                  );
                })
              }
            >
              Enable on-site payments
            </Button>
          </div>
        )}
      </section>

      {/* COD */}
      <section className="premium-card space-y-3 p-4">
        <div>
          <h2 className="text-sm font-bold text-brand-ink">Cash on delivery</h2>
          <p className="mt-0.5 text-[11px] leading-snug text-brand-muted">
            Default on for Indian shops. Cash risk is yours (fake orders, no-shows).
          </p>
        </div>

        {!isPro || !proCheckoutOn ? (
          <p className="text-[11px] text-brand-muted">
            Enable on-site checkout first to offer COD as a pay method.
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
                {cod ? "Shown at checkout" : "Hidden from checkout"}
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
}: {
  label: string;
  value: string;
  tone: "ok" | "warn" | "muted";
}) {
  return (
    <div className="rounded-lg border border-brand-ink/8 bg-brand-mist/50 px-2.5 py-2">
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
