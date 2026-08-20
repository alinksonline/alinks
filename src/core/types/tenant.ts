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
  /** Presence / profile — no sales on ALINKS */
  "presence",
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

import type { BusinessProfile } from "./business-profile";
import type { ThemeConfig } from "./page";

export interface Business {
  id: string;
  tenantId: string;
  handle: string;
  name: string;
  vertical: BusinessVertical;
  /** Industry group (presence, salon_beauty, …) — falls back from vertical when missing. */
  industryGroup?: string;
  industryType?: string;
  /** retail | wholesale | both */
  tradeMode?: string;
  /** Clinic/pharmacy regulated gate: approved | pending | pending_review | rejected */
  verticalGateStatus?: string;
  creatorPartnerTier?: string | null;
  tier: SubscriptionTier;
  isPublished: boolean;
  checkoutMode?: "lite" | "pro";
  codEnabled?: boolean;
  customerCancelOrders?: boolean;
  customerModifyOrders?: boolean;
  /** products | services | both */
  catalogMode?: "products" | "services" | "both";
  /** manual | third_party */
  deliveryOps?: "manual" | "third_party";
  deliveryPartnerName?: string | null;
  /** Tenant connected their own Razorpay (public flag only — never secrets) */
  onlinePayEnabled?: boolean;
  googleSpreadsheetId?: string | null;
  customDomain?: string | null;
  customDomainVerified?: boolean;
  /** Parsed business profile (contact + socials + branding assets) */
  profile?: BusinessProfile;
  /** Tenant mini-site theme (colors, mode, radius, font) */
  theme?: ThemeConfig | Record<string, unknown> | null;
  branding?: Record<string, unknown> | null;
  /** Active module SKUs when loaded */
  entitledSkus?: string[];
}