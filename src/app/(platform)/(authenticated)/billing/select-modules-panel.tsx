"use client";

import { useMemo, useState, useTransition } from "react";
import {
  updateModuleSelectionsAction,
  type BillingModulesPayload,
} from "@/app/actions/billing-modules";
import { Button } from "@/components/ui/button";
import {
  BILLING_CYCLES,
  formatInr,
  type BillingCycle,
  type SubscriptionTier,
} from "@/core/config/tiers";
import { cn } from "@/core/utils/cn";
import { findSeasonalCoupon, FOOD_OPS_BUNDLE } from "@/core/config/module-gates";
import {
  applyPctOff,
  buildSelectModulesQuote,
  type ModulePriceLine,
} from "@/core/config/select-modules-quote";

type Props = {
  data: BillingModulesPayload;
  /** Website plan currently selected on the page (may differ from saved tier). */
  selectedTier?: SubscriptionTier;
  defaultCycle?: BillingCycle;
  onCycleChange?: (cycle: BillingCycle) => void;
};

export function SelectModulesPanel({
  data,
  selectedTier,
  defaultCycle = "annual",
  onCycleChange,
}: Props) {
  const tier = selectedTier ?? data.tier;
  const [cycle, setCycle] = useState<BillingCycle>(defaultCycle);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(data.selectable.filter((m) => m.entitled).map((m) => m.sku)),
  );
  const [couponInput, setCouponInput] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const seasonalCoupon = useMemo(() => {
    if (!appliedCouponCode) return null;
    return findSeasonalCoupon(appliedCouponCode, data.industryGroup);
  }, [appliedCouponCode, data.industryGroup]);

  const catalogForQuote = useMemo(
    () =>
      data.selectable.map((m) => ({
        sku: m.sku,
        name: m.name,
        description: "",
        category: m.category as "presence" | "website" | "booking" | "commerce" | "ops",
        industryAllowlist: ["*"] as const,
        includedInWebsite: m.includedInWebsite,
        monthlyPrice: m.monthlyList,
        yearlyPrice: m.yearlyList,
        effectiveMonthly: m.monthlyList,
        effectiveYearly: m.yearlyList,
        status: m.status,
        enabled: true,
      })),
    [data.selectable],
  );

  const quote = useMemo(
    () =>
      buildSelectModulesQuote({
        tier,
        cycle,
        selectedSkus: Array.from(selected),
        catalog: catalogForQuote,
        creator: {
          partnerTier: data.creator.partnerTier,
          discountPctMonthly: data.creator.discountPctMonthly,
          discountPctYearly: data.creator.discountPctYearly,
          industryPctMonthly: data.creator.industryPctMonthly,
          industryPctYearly: data.creator.industryPctYearly,
          industryGroup: data.industryGroup,
        },
        seasonalCoupon,
        applyFoodOpsBundle: true,
      }),
    [tier, cycle, selected, catalogForQuote, data.creator, data.industryGroup, seasonalCoupon],
  );

  function setCycleBoth(next: BillingCycle) {
    setCycle(next);
    onCycleChange?.(next);
  }

  function toggleSku(sku: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(sku)) next.delete(sku);
      else next.add(sku);
      return next;
    });
    setMessage(null);
  }

  function save() {
    startTransition(async () => {
      const previously = new Set(data.selectable.filter((m) => m.entitled).map((m) => m.sku));
      const enableSkus = Array.from(selected).filter((s) => !previously.has(s));
      const disableSkus = Array.from(previously).filter((s) => !selected.has(s));

      const r = await updateModuleSelectionsAction({ enableSkus, disableSkus });
      if (!r.success) {
        setMessage(r.error);
        return;
      }
      setMessage(
        enableSkus.length || disableSkus.length
          ? "Modules updated. Checkout payment connects when Razorpay subscription is live — modules are unlocked on this business now."
          : "No changes.",
      );
    });
  }

  const isPresence = data.industryGroup === "presence";
  const hasPartner = Boolean(data.creator.partnerTier) || quote.creatorPartnerActive;

  return (
    <section className="mt-10 space-y-4">
      <div>
        <p className="premium-label">Modules</p>
        <h2 className="mt-1 text-xl font-bold text-brand-ink">Select modules</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Add only what you need for <strong>{data.businessName}</strong>. Each module is priced
          separately and stacks on your website plan. Never sold as a forced pack.
        </p>
        {isPresence && (
          <p className="mt-2 text-xs text-brand-muted">
            Presence is website + creator tools only — no shop or checkout modules.
            {hasPartner ? (
              <>
                {" "}
                <strong className="text-brand-ink">Creator Partner</strong> pricing applies to your
                website plan and Presence add-ons.
              </>
            ) : null}
          </p>
        )}
      </div>

      <div className="inline-flex rounded-lg border border-brand-ink/10 bg-white p-1">
        {BILLING_CYCLES.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setCycleBoth(option)}
            className={cn(
              "rounded-md px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-all",
              cycle === option
                ? "bg-brand-ink text-white"
                : "text-brand-ink/50 hover:text-brand-ink",
            )}
          >
            {option}
          </button>
        ))}
      </div>

      {data.included.length > 0 && (
        <div className="rounded-2xl border border-brand-ink/10 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
            Included with website
          </p>
          <ul className="mt-2 space-y-1 text-sm text-brand-muted">
            {data.included.map((m) => (
              <li key={m.sku} className="flex justify-between gap-2">
                <span>{m.name}</span>
                <span className="font-mono text-[10px] text-emerald-700">included</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
          Add modules
        </p>
        {data.selectable.length === 0 ? (
          <p className="rounded-xl border border-dashed border-brand-ink/15 bg-white px-4 py-6 text-sm text-brand-muted">
            No optional modules for this industry yet — your website plan covers the core tools.
          </p>
        ) : (
          data.selectable.map((m) => (
            <ModuleRow
              key={m.sku}
              module={m}
              cycle={cycle}
              checked={selected.has(m.sku)}
              onToggle={() => toggleSku(m.sku)}
              creatorPct={
                quote.creatorDiscountPct > 0 &&
                (m.category === "presence" || m.category === "website")
                  ? quote.creatorDiscountPct
                  : 0
              }
            />
          ))
        )}
      </div>

      <div className="rounded-2xl border border-brand-ink/10 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
          Seasonal coupon
        </p>
        <p className="mt-1 text-[11px] text-brand-muted">
          Platform codes for module lines only (not website plan). Examples: MONSOON10, FOODFEST15,
          CREATOR20.
        </p>
        <div className="mt-2 flex gap-2">
          <input
            className="w-full rounded-lg border px-3 py-2 font-mono text-sm uppercase"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            placeholder="MONSOON10"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              const hit = findSeasonalCoupon(couponInput, data.industryGroup);
              if (!hit) {
                setAppliedCouponCode(null);
                setCouponError("Invalid, expired, or not for your industry");
                return;
              }
              setAppliedCouponCode(hit.code);
              setCouponError(null);
            }}
          >
            Apply
          </Button>
        </div>
        {appliedCouponCode && seasonalCoupon ? (
          <p className="mt-2 text-xs text-emerald-800">
            {seasonalCoupon.code}: {seasonalCoupon.description}
          </p>
        ) : null}
        {couponError ? <p className="mt-2 text-xs text-red-600">{couponError}</p> : null}
        {data.industryGroup === "food" ? (
          <p className="mt-2 text-[11px] text-brand-muted">
            Select all three food ops modules for optional{" "}
            <strong>{FOOD_OPS_BUNDLE.label}</strong> (−{FOOD_OPS_BUNDLE.discountPct}%).
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-brand-ink/10 bg-stone-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
          Invoice preview
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          {quote.lines.map((line) => (
            <li key={`${line.kind}-${line.sku}`} className="flex items-start justify-between gap-3">
              <span className="text-brand-ink">
                {line.label}
                {line.kind === "module" && line.discountPct > 0 ? (
                  <span className="ml-1 font-mono text-[10px] text-emerald-700">
                    −{line.discountPct}%
                  </span>
                ) : null}
                {line.kind === "website_plan" && line.discountPct > 0 ? (
                  <span className="ml-1 font-mono text-[10px] text-emerald-700">
                    −{line.discountPct}% Creator
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 font-mono text-xs text-brand-ink">
                {line.kind === "discount"
                  ? "applied"
                  : cycle === "monthly"
                    ? `₹${formatInr(line.monthly)}/mo`
                    : `₹${formatInr(line.yearly)}/yr`}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-baseline justify-between border-t border-brand-ink/10 pt-3">
          <span className="font-semibold text-brand-ink">Total</span>
          <span className="font-display text-xl font-bold text-brand-ink">
            ₹{formatInr(quote.cycleTotal)}
            <span className="text-sm font-normal text-brand-muted">
              {cycle === "monthly" ? "/mo" : "/yr billed"}
            </span>
          </span>
        </div>
        {quote.creatorPartnerActive && (
          <p className="mt-2 font-mono text-[10px] text-emerald-800">
            creator_partner · {quote.creatorDiscountPct}% on plan + Presence add-ons
          </p>
        )}
        {quote.foodOpsBundleApplied && (
          <p className="mt-1 font-mono text-[10px] text-emerald-800">
            food_ops_pack · −{FOOD_OPS_BUNDLE.discountPct}% on channel modules
          </p>
        )}
        {quote.seasonalCouponCode && (
          <p className="mt-1 font-mono text-[10px] text-emerald-800">
            coupon={quote.seasonalCouponCode}
          </p>
        )}
        <p className="mt-2 font-mono text-[10px] text-stone-400">
          razorpay_subscription=phase_1 · selection_unlocks_modules
        </p>
      </div>

      <Button type="button" onClick={save} disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save module selection"}
      </Button>
      {message && <p className="text-sm text-brand-muted">{message}</p>}
    </section>
  );
}

function ModuleRow({
  module: m,
  cycle,
  checked,
  onToggle,
  creatorPct,
}: {
  module: ModulePriceLine;
  cycle: BillingCycle;
  checked: boolean;
  onToggle: () => void;
  creatorPct: number;
}) {
  const list = cycle === "monthly" ? m.monthlyList : m.yearlyList;
  const charged = applyPctOff(list, creatorPct);
  const free = list === 0;

  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-2xl border bg-white p-4 transition-colors",
        checked ? "border-brand-turquoise/50 ring-1 ring-brand-turquoise/30" : "border-brand-ink/10",
      )}
    >
      <input
        type="checkbox"
        className="mt-1"
        checked={checked}
        onChange={onToggle}
        aria-label={`Select module ${m.name}`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-brand-ink">{m.name}</p>
            <p className="font-mono text-[10px] text-stone-400">{m.sku}</p>
          </div>
          <div className="text-right">
            {free ? (
              <p className="font-mono text-xs text-emerald-700">free</p>
            ) : (
              <>
                {creatorPct > 0 && charged !== list && (
                  <p className="font-mono text-[10px] text-stone-400 line-through">
                    ₹{formatInr(list)}
                  </p>
                )}
                <p className="font-mono text-sm font-semibold text-brand-ink">
                  ₹{formatInr(charged)}
                  <span className="text-[10px] font-normal text-brand-muted">
                    {cycle === "monthly" ? "/mo" : "/yr"}
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
        {m.status === "stub" && (
          <p className="mt-1 text-[11px] text-amber-700">Coming soon on public site — can still reserve.</p>
        )}
        {m.entitled && (
          <p className="mt-1 font-mono text-[10px] text-emerald-700">active</p>
        )}
      </div>
    </label>
  );
}
