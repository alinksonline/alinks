/**
 * Paid module SKU gates — has(sku) required before feature unlock.
 * Free/included website modules are not listed here.
 */

import type { FoodChannel } from "./food-compat";

/** Food ops channel → paid module SKU. WhatsApp is free Layer 1 (no SKU). */
export const FOOD_CHANNEL_MODULE_SKU: Record<Exclude<FoodChannel, "whatsapp">, string> = {
  pickup: "food.pickup",
  delivery: "food.delivery",
  dine_in: "food.dine_in",
};

export const PAY_THEN_BOOK_SKU = "sb.pay_then_book";
export const AUTO_PARTS_RETAIL_SKU = "auto.parts_retail";
export const REMOVE_WATERMARK_SKU = "web.remove_watermark";

/** Optional food ops bundle: select all three paid channels → cart discount. */
export const FOOD_OPS_BUNDLE = {
  id: "food.bundle.ops",
  label: "Food ops pack",
  /** Percent off the sum of the three food channel module lines when all selected. */
  discountPct: 10,
  skus: ["food.pickup", "food.delivery", "food.dine_in"] as const,
} as const;

export function foodChannelModuleSku(channel: FoodChannel): string | null {
  if (channel === "whatsapp") return null;
  return FOOD_CHANNEL_MODULE_SKU[channel];
}

export function missingModuleMessage(sku: string): string {
  const labels: Record<string, string> = {
    "food.pickup": "Pickup orders",
    "food.delivery": "Delivery orders",
    "food.dine_in": "Restaurant dine-in",
    "sb.pay_then_book": "Pay then book",
    "auto.parts_retail": "Parts retail",
    "web.remove_watermark": "Remove watermark",
  };
  const name = labels[sku] ?? sku;
  return `Add “${name}” under Billing → Select modules to unlock this feature.`;
}

/**
 * Seasonal platform coupons for Select modules cart (W3.C).
 * Trial promos (FIRST100 / FREEMONTH) stay separate in platform/billing/promo.
 */
export type SeasonalModuleCoupon = {
  code: string;
  /** % off module lines only (not website plan). */
  moduleDiscountPct: number;
  /** Optional industry allowlist; empty = all. */
  industryAllowlist: readonly string[];
  /** Calendar window (UTC date YYYY-MM-DD inclusive). */
  validFrom: string;
  validTo: string;
  description: string;
};

export const SEASONAL_MODULE_COUPONS: readonly SeasonalModuleCoupon[] = [
  {
    code: "MONSOON10",
    moduleDiscountPct: 10,
    industryAllowlist: [],
    validFrom: "2026-06-01",
    validTo: "2026-09-30",
    description: "Monsoon modules — 10% off selected modules",
  },
  {
    code: "FOODFEST15",
    moduleDiscountPct: 15,
    industryAllowlist: ["food"],
    validFrom: "2026-01-01",
    validTo: "2026-12-31",
    description: "Food industry — 15% off food modules",
  },
  {
    code: "CREATOR20",
    moduleDiscountPct: 20,
    industryAllowlist: ["presence"],
    validFrom: "2026-01-01",
    validTo: "2026-12-31",
    description: "Creator modules — 20% off Presence add-ons",
  },
] as const;

export function findSeasonalCoupon(
  code: string,
  industryGroup: string,
  todayIso = new Date().toISOString().slice(0, 10),
): SeasonalModuleCoupon | null {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;
  const hit = SEASONAL_MODULE_COUPONS.find((c) => c.code === normalized);
  if (!hit) return null;
  if (todayIso < hit.validFrom || todayIso > hit.validTo) return null;
  if (hit.industryAllowlist.length > 0 && !hit.industryAllowlist.includes(industryGroup)) {
    return null;
  }
  return hit;
}
