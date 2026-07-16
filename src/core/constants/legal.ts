/** Draft versions — replace when lawyer approves final text */
export const LEGAL_DOC_VERSION = "0.1-draft";

export const LEGAL_DOC_TYPES = {
  PLATFORM_TOS: "PLATFORM_TOS",
  PLATFORM_PRIVACY: "PLATFORM_PRIVACY",
  PLATFORM_AUP: "PLATFORM_AUP",
  TENANT_TOS_PUBLISHED: "TENANT_TOS_PUBLISHED",
  TENANT_PRIVACY_PUBLISHED: "TENANT_PRIVACY_PUBLISHED",
  PAYMENT_ADDENDUM: "PAYMENT_ADDENDUM",
  DATA_STORAGE_ADDENDUM: "DATA_STORAGE_ADDENDUM",
  GOOGLE_CONNECT: "GOOGLE_CONNECT",
  CUSTOMER_CHECKOUT: "CUSTOMER_CHECKOUT",
  CUSTOMER_CLINIC_BOOKING: "CUSTOMER_CLINIC_BOOKING",
  PHARMACY_OTC_ACK: "PHARMACY_OTC_ACK",
  AI_CONTENT_REVIEW: "AI_CONTENT_REVIEW",
  /** Creator Partner terms (discount ↔ promote ALINKS) — Presence influencers */
  CREATOR_PARTNER: "CREATOR_PARTNER",
} as const;

export type LegalDocType = (typeof LEGAL_DOC_TYPES)[keyof typeof LEGAL_DOC_TYPES];

export const STANDARD_PAGE_SLUGS = ["home", "about", "services", "contact", "legal"] as const;
export type StandardPageSlug = (typeof STANDARD_PAGE_SLUGS)[number];