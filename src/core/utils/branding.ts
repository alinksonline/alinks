import { REMOVE_WATERMARK_SKU } from "@/core/config/module-gates";
import type { SubscriptionTier } from "@/core/config/tiers";

/**
 * Q029 — Basic (and free) show ALINKS watermark on public sites
 * unless tenant has Select modules SKU `web.remove_watermark` or Pro/Enterprise tier.
 */
export function shouldShowAlinksWatermark(
  tier: SubscriptionTier | "free",
  entitledSkus?: readonly string[] | null,
): boolean {
  if (entitledSkus?.includes(REMOVE_WATERMARK_SKU)) return false;
  if (tier === "pro" || tier === "enterprise") return false;
  return tier === "basic" || tier === "free";
}