import type { SubscriptionTier } from "@/core/config/tiers";

/** Q029 — Basic (and future free tier) show ALINKS watermark on public sites */
export function shouldShowAlinksWatermark(tier: SubscriptionTier | "free"): boolean {
  return tier === "basic" || tier === "free";
}