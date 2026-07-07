import type { SubscriptionTier } from "@/core/config/tiers";

export const BUSINESS_VERTICALS = [
  "salon",
  "beauty",
  "kirana",
  "grocery",
  "ecommerce",
  "restaurant",
  "clinic",
  "pharmacy",
  "general",
] as const;

export type BusinessVertical = (typeof BUSINESS_VERTICALS)[number];

export type TenantAccountStatus = "trial" | "active" | "past_due" | "suspended";

export interface TenantAccount {
  id: string;
  email: string;
  phone: string;
  tier: SubscriptionTier;
  status: TenantAccountStatus;
}

export interface Business {
  id: string;
  tenantId: string;
  handle: string;
  name: string;
  vertical: BusinessVertical;
  tier: SubscriptionTier;
  isPublished: boolean;
  checkoutMode?: "lite" | "pro";
  codEnabled?: boolean;
  googleSpreadsheetId?: string | null;
  customDomain?: string | null;
  customDomainVerified?: boolean;
}