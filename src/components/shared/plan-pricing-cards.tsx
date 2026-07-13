"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BILLING_CYCLES,
  formatInr,
  getAnnualBilledTotal,
  getAnnualSavings,
  getMaxAnnualSavingsPercent,
  getPerMonthPrice,
  LAUNCH_STACK,
  PLAN_DETAILS,
  SUBSCRIPTION_TIERS,
  type BillingCycle,
  type SubscriptionTier,
} from "@/core/config/tiers";
import { Button } from "@/components/ui/button";
import { cn } from "@/core/utils/cn";

type PlanPricingCardsProps = {
  variant?: "marketing" | "billing";
  currentTier?: SubscriptionTier;
  defaultCycle?: BillingCycle;
};

export function PlanPricingCards({
  variant = "marketing",
  currentTier,
  defaultCycle = "annual",
}: PlanPricingCardsProps) {
  const [cycle, setCycle] = useState<BillingCycle>(defaultCycle);
  const maxSave = getMaxAnnualSavingsPercent();
  const isDark = variant === "marketing";

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
        <div
          className={cn(
            "inline-flex w-full max-w-xs rounded border p-1 sm:w-auto",
            isDark ? "border-brand-cream/10 bg-brand-ink/80" : "border-brand-ink/10 bg-white",
          )}
        >
          {BILLING_CYCLES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCycle(option)}
              className={cn(
                "flex-1 rounded px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider transition-all sm:flex-none sm:px-5",
                cycle === option
                  ? isDark
                    ? "bg-brand-purple/20 text-brand-turquoise-light"
                    : "bg-brand-ink text-white"
                  : isDark
                    ? "text-brand-cream/50 hover:text-brand-cream"
                    : "text-brand-ink/50 hover:text-brand-ink",
              )}
            >
              {option}
            </button>
          ))}
        </div>
        {cycle === "annual" && (
          <span className={cn("font-mono text-[10px]", isDark ? "text-zinc-500" : "text-stone-400")}>
            save_up_to_{maxSave}%
          </span>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4">
        {SUBSCRIPTION_TIERS.map((tier) => {
          const details = PLAN_DETAILS[tier];
          const perMonth = getPerMonthPrice(tier, cycle);
          const listPrice = getPerMonthPrice(tier, "monthly");
          const savings = getAnnualSavings(tier);
          const isCurrent = currentTier === tier;
          const isPro = tier === "pro";

          return (
            <div
              key={tier}
              className={cn(
                "flex min-w-0 flex-col rounded-lg border p-5 sm:p-6",
                isDark
                  ? cn(
                      "bg-brand-ink/60 backdrop-blur-sm",
                      isPro ? "border-brand-turquoise/40 shadow-accent" : "border-brand-cream/10",
                    )
                  : cn("bg-white", isPro ? "border-brand-purple/30 shadow-accent" : "border-brand-ink/10"),
                isCurrent && "ring-2 ring-brand-turquoise",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className={cn("font-mono text-[10px] uppercase", isDark ? "text-brand-turquoise-light" : "text-brand-purple")}>
                    tier.{tier}
                  </p>
                  <h3 className={cn("mt-1 font-display text-lg font-semibold", isDark ? "text-brand-cream" : "text-brand-ink")}>
                    {details.label}
                  </h3>
                </div>
                {isPro && variant === "marketing" && (
                  <span className="rounded-full border border-brand-turquoise/30 bg-brand-purple/20 px-2 py-0.5 font-mono text-[9px] text-brand-turquoise-light">
                    popular
                  </span>
                )}
              </div>

              <div className="mt-5">
                {cycle === "annual" && (
                  <p className={cn("font-mono text-sm line-through", isDark ? "text-zinc-600" : "text-stone-400")}>
                    ₹{formatInr(listPrice)}
                  </p>
                )}
                <p className={cn("font-display text-3xl font-bold", isDark ? "text-brand-cream" : "text-brand-ink")}>
                  ₹{formatInr(perMonth)}
                  <span className={cn("text-sm font-normal", isDark ? "text-zinc-500" : "text-stone-400")}>/mo</span>
                </p>
                <p className={cn("mt-2 break-words font-mono text-[10px]", isDark ? "text-zinc-500" : "text-stone-400")}>
                  {cycle === "annual"
                    ? `billed_yearly=₹${formatInr(getAnnualBilledTotal(tier))}${savings.percent > 0 ? ` · −${savings.percent}%` : ""}`
                    : "cycle=monthly · list_price"}
                </p>
              </div>

              <ul className={cn("mt-5 flex-1 space-y-2 font-mono text-[11px] sm:text-xs", isDark ? "text-zinc-400" : "text-stone-600")}>
                {details.highlights.map((item) => (
                  <li key={item} className="flex gap-2 break-words">
                    <span className={isDark ? "text-brand-turquoise-light" : "text-brand-turquoise"}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              {variant === "marketing" ? (
                <Link href="/signup" className="mt-6 block sm:mt-8">
                  <Button variant={isPro ? "bronze" : "ghost"} className={isDark && !isPro ? "!border-brand-cream/15 !text-brand-cream" : ""}>
                    {isPro ? "Start Pro trial" : "Get started"}
                  </Button>
                </Link>
              ) : (
                <Button className="mt-6 w-full font-mono text-xs" variant="secondary" disabled>
                  checkout_phase_1
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {cycle === "annual" && (
        <p className={cn("mt-6 text-center font-mono text-[10px] leading-relaxed", isDark ? "text-zinc-600" : "text-stone-400")}>
          founders_lock({LAUNCH_STACK.foundersLockLimit}) · FIRST100({LAUNCH_STACK.first100PayMonths}→
          {LAUNCH_STACK.first100GetMonths})
        </p>
      )}
    </div>
  );
}