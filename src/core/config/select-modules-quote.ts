/**
 * Select modules cart quote — website plan + module SKUs.
 * Frontend language: “Select modules” / “Modules” / “Creator pricing”.
 * Never “à la carte”.
 */

import {
  CREATOR_PARTNER_TIERS,
  type CreatorPartnerTierCode,
} from "@/core/config/industries";
import { FOOD_OPS_BUNDLE, type SeasonalModuleCoupon } from "@/core/config/module-gates";
import type { ModuleDef } from "@/core/config/modules";
import {
  formatInr,
  getAnnualBilledTotal,
  getPerMonthPrice,
  type BillingCycle,
  type SubscriptionTier,
} from "@/core/config/tiers";

export type ModulePriceLine = {
  sku: string;
  name: string;
  category: string;
  /** List monthly INR. */
  monthlyList: number;
  /** List yearly billed total INR. */
  yearlyList: number;
  /** After Creator Partner discount (if any). */
  monthlyCharged: number;
  yearlyCharged: number;
  includedInWebsite: boolean;
  /** Active entitlement on this business. */
  entitled: boolean;
  status: ModuleDef["status"];
};

export type QuoteLine = {
  kind: "website_plan" | "module" | "discount";
  sku: string;
  label: string;
  monthly: number;
  yearly: number;
  discountPct: number;
};

export type SelectModulesQuote = {
  cycle: BillingCycle;
  tier: SubscriptionTier;
  lines: QuoteLine[];
  /** Sum of monthly list charges (after discounts). */
  monthlyTotal: number;
  /** Sum of yearly billed totals (after discounts). */
  yearlyTotal: number;
  /** Amount for the active cycle (monthly charge or yearly billed). */
  cycleTotal: number;
  creatorDiscountPct: number;
  creatorPartnerActive: boolean;
  seasonalCouponCode: string | null;
  foodOpsBundleApplied: boolean;
};

export type CreatorDiscountInput = {
  /** Partner tier A|B|C|D when accepted. */
  partnerTier?: string | null;
  /** Business-level overrides (Superadmin or onboarding). */
  discountPctMonthly?: number | null;
  discountPctYearly?: number | null;
  /** Industry-level Superadmin defaults for Presence. */
  industryPctMonthly?: number | null;
  industryPctYearly?: number | null;
  /** Only Presence creators get Partner cuts. */
  industryGroup: string;
};

/** Resolve % off for a billing cycle (0–100). */
export function resolveCreatorDiscountPct(
  cycle: BillingCycle,
  input: CreatorDiscountInput,
): number {
  if (input.industryGroup !== "presence") return 0;

  const fromBusiness =
    cycle === "monthly" ? input.discountPctMonthly : input.discountPctYearly;
  if (typeof fromBusiness === "number" && fromBusiness >= 0) {
    return Math.min(100, Math.max(0, fromBusiness));
  }

  const fromIndustry =
    cycle === "monthly" ? input.industryPctMonthly : input.industryPctYearly;
  if (typeof fromIndustry === "number" && fromIndustry >= 0) {
    return Math.min(100, Math.max(0, fromIndustry));
  }

  const code = (input.partnerTier ?? "").toUpperCase() as CreatorPartnerTierCode;
  const tier = CREATOR_PARTNER_TIERS[code];
  if (!tier) return 0;
  return cycle === "monthly" ? tier.discountPctMonthly : tier.discountPctYearly;
}

export function applyPctOff(amount: number, pct: number): number {
  if (amount <= 0 || pct <= 0) return amount;
  if (pct >= 100) return 0;
  return Math.round(amount * (1 - pct / 100));
}

/** Creator discount applies to website plan + presence category paid modules only. */
export function moduleEligibleForCreatorDiscount(mod: Pick<ModuleDef, "category">): boolean {
  return mod.category === "presence" || mod.category === "website";
}

export function buildSelectModulesQuote(input: {
  tier: SubscriptionTier;
  cycle: BillingCycle;
  /** Paid module SKUs in the cart (not included-in-website). */
  selectedSkus: readonly string[];
  catalog: readonly (ModuleDef & {
    effectiveMonthly?: number;
    effectiveYearly?: number;
  })[];
  creator: CreatorDiscountInput;
  /** Optional seasonal coupon already validated. */
  seasonalCoupon?: SeasonalModuleCoupon | null;
  /** Apply optional food ops bundle when all three channel SKUs selected. */
  applyFoodOpsBundle?: boolean;
}): SelectModulesQuote {
  const bySku = new Map(input.catalog.map((m) => [m.sku, m]));
  const discountPct = resolveCreatorDiscountPct(input.cycle, input.creator);
  const partnerActive = discountPct > 0 && Boolean(input.creator.partnerTier || discountPct);

  const planMonthlyList = getPerMonthPrice(input.tier, "monthly");
  const planYearlyList = getAnnualBilledTotal(input.tier);
  const planDiscount =
    input.creator.industryGroup === "presence" && discountPct > 0 ? discountPct : 0;

  const lines: QuoteLine[] = [
    {
      kind: "website_plan",
      sku: `plan.${input.tier}`,
      label: `Website ${input.tier.charAt(0).toUpperCase()}${input.tier.slice(1)}`,
      monthly: applyPctOff(planMonthlyList, planDiscount),
      yearly: applyPctOff(planYearlyList, planDiscount),
      discountPct: planDiscount,
    },
  ];

  const coupon = input.seasonalCoupon ?? null;
  const couponPct = coupon?.moduleDiscountPct ?? 0;

  for (const sku of input.selectedSkus) {
    const mod = bySku.get(sku);
    if (!mod) continue;
    if (mod.includedInWebsite) continue;
    if (!mod.enabled) continue;

    const monthlyList = mod.effectiveMonthly ?? mod.monthlyPrice;
    const yearlyList = mod.effectiveYearly ?? mod.yearlyPrice;
    let modDiscount =
      discountPct > 0 && moduleEligibleForCreatorDiscount(mod) ? discountPct : 0;

    // Seasonal coupon stacks only on module lines (not plan). Prefer higher of creator vs coupon on presence add-ons.
    if (couponPct > 0) {
      if (moduleEligibleForCreatorDiscount(mod)) {
        modDiscount = Math.max(modDiscount, couponPct);
      } else {
        modDiscount = couponPct;
      }
    }

    lines.push({
      kind: "module",
      sku: mod.sku,
      label: mod.name,
      monthly: applyPctOff(monthlyList, modDiscount),
      yearly: applyPctOff(yearlyList, modDiscount),
      discountPct: modDiscount,
    });
  }

  // Optional food ops pack: extra % off the three channel lines when all selected
  let foodOpsBundleApplied = false;
  const selectedSet = new Set(input.selectedSkus);
  const allFoodOps =
    input.applyFoodOpsBundle !== false &&
    input.creator.industryGroup === "food" &&
    FOOD_OPS_BUNDLE.skus.every((s) => selectedSet.has(s));

  if (allFoodOps) {
    foodOpsBundleApplied = true;
    let monthlySave = 0;
    let yearlySave = 0;
    for (const line of lines) {
      if (line.kind === "module" && (FOOD_OPS_BUNDLE.skus as readonly string[]).includes(line.sku)) {
        const mSave = Math.round(line.monthly * (FOOD_OPS_BUNDLE.discountPct / 100));
        const ySave = Math.round(line.yearly * (FOOD_OPS_BUNDLE.discountPct / 100));
        line.monthly -= mSave;
        line.yearly -= ySave;
        monthlySave += mSave;
        yearlySave += ySave;
      }
    }
    if (monthlySave > 0 || yearlySave > 0) {
      lines.push({
        kind: "discount",
        sku: FOOD_OPS_BUNDLE.id,
        label: `${FOOD_OPS_BUNDLE.label} (−${FOOD_OPS_BUNDLE.discountPct}%)`,
        monthly: 0,
        yearly: 0,
        discountPct: FOOD_OPS_BUNDLE.discountPct,
      });
    }
  }

  const monthlyTotal = lines.reduce((s, l) => s + l.monthly, 0);
  const yearlyTotal = lines.reduce((s, l) => s + l.yearly, 0);

  return {
    cycle: input.cycle,
    tier: input.tier,
    lines,
    monthlyTotal,
    yearlyTotal,
    cycleTotal: input.cycle === "monthly" ? monthlyTotal : yearlyTotal,
    creatorDiscountPct: discountPct,
    creatorPartnerActive: partnerActive && planDiscount > 0,
    seasonalCouponCode: coupon?.code ?? null,
    foodOpsBundleApplied,
  };
}

export function formatQuoteInr(amount: number): string {
  return `₹${formatInr(amount)}`;
}

/** Map catalog row + entitlement into a display line for the panel. */
export function toModulePriceLine(
  mod: ModuleDef & { effectiveMonthly?: number; effectiveYearly?: number },
  entitledSkus: readonly string[],
): ModulePriceLine {
  return {
    sku: mod.sku,
    name: mod.name,
    category: mod.category,
    monthlyList: mod.effectiveMonthly ?? mod.monthlyPrice,
    yearlyList: mod.effectiveYearly ?? mod.yearlyPrice,
    monthlyCharged: mod.effectiveMonthly ?? mod.monthlyPrice,
    yearlyCharged: mod.effectiveYearly ?? mod.yearlyPrice,
    includedInWebsite: mod.includedInWebsite,
    entitled: entitledSkus.includes(mod.sku),
    status: mod.status,
  };
}
