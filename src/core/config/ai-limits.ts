import type { SubscriptionTier } from "./tiers";

export type AiTaskType = "field_generate" | "bulk_product" | "vision" | "seo_meta" | "share_caption";

export const AI_TIER_LIMITS: Record<SubscriptionTier, Partial<Record<AiTaskType, number>>> = {
  basic: { field_generate: 100, bulk_product: 25, vision: 10, seo_meta: 50, share_caption: 30 },
  pro: { field_generate: 500, bulk_product: 200, vision: 100, seo_meta: 200, share_caption: 100 },
  enterprise: { field_generate: 999999, bulk_product: 999999, vision: 999999, seo_meta: 999999, share_caption: 999999 },
};

export const AI_CREDIT_PACKS = [
  { id: "pack_500", credits: 500, priceInr: 99 },
  { id: "pack_2000", credits: 2000, priceInr: 349 },
  { id: "pack_10000", credits: 10000, priceInr: 1499 },
] as const;
