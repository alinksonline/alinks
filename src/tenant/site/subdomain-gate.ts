import type { SubscriptionTier } from "@/core/config/tiers";
import { canUseSubdomain } from "@/core/utils/tier-gates";

export function assertSubdomainAccess(tier: SubscriptionTier, urlMode: string | null): { allowed: boolean; reason?: string } {
  if (urlMode !== "subdomain") return { allowed: true };
  if (canUseSubdomain(tier)) return { allowed: true };
  return {
    allowed: false,
    reason: "Subdomain URLs require a Pro or Enterprise plan. Visit the path URL instead.",
  };
}