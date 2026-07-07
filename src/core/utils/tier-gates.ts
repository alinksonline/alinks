import type { SubscriptionTier } from "@/core/config/tiers";

export function canUseSubdomain(tier: SubscriptionTier): boolean {
  return tier === "pro" || tier === "enterprise";
}

export function canUseCustomDomain(tier: SubscriptionTier): boolean {
  return tier === "pro" || tier === "enterprise";
}

export function canUseProCheckout(tier: SubscriptionTier, checkoutMode: string): boolean {
  return (tier === "pro" || tier === "enterprise") && checkoutMode === "pro";
}

export function canUseTapBlastPro(tier: SubscriptionTier): boolean {
  return tier === "pro" || tier === "enterprise";
}