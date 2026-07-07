import type { SubscriptionTier } from "@/core/config/tiers";

/** Q021/Q022 locked limits */
export const TIER_LIMITS = {
  basic: { businesses: 1, products: 25 },
  pro: { businesses: 1, products: 200 },
  enterprise: { businesses: 3, products: 2000 },
} as const satisfies Record<SubscriptionTier, { businesses: number; products: number }>;

export const MAX_PAGES_PER_BUSINESS = 5;

export const RESERVED_HANDLES = new Set([
  "www",
  "app",
  "api",
  "admin",
  "dashboard",
  "login",
  "signup",
  "mail",
  "support",
  "help",
  "terms",
  "privacy",
  "blog",
  "status",
  "cdn",
  "static",
  "assets",
  "custom",
  "_next",
]);