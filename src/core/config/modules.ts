/**
 * Module catalog (F0.2) — each paid module priced separately.
 * Frontend: “Select modules” / “Modules” / “Add modules” — never “à la carte”.
 * Presence creators: “Creator pricing” / “Influencer plan”.
 *
 * Industry allowlist controls visibility; entitlements control has(sku).
 * Google Calendar is FREE where applicable — not a paid SKU here.
 */

import type { IndustryGroup } from "./industries";

export type ModuleSku =
  | "pr.presence_core"
  | "pr.link_stack"
  | "pr.gallery"
  | "pr.contact"
  | "pr.share_kit"
  | "pr.media_kit"
  | "pr.social_proof"
  | "pr.highlights"
  | "pr.analytics_lite"
  | "web.custom_domain"
  | "web.remove_watermark"
  | "book.appointments_core"
  | "food.menu_display"
  | "retail.storefront";

export type ModuleCategory = "presence" | "website" | "booking" | "commerce" | "ops";

export type ModuleDef = {
  sku: ModuleSku | string;
  /** Customer-facing name (professional — never “à la carte”). */
  name: string;
  description: string;
  category: ModuleCategory;
  /** Empty = all industries that allow this category via flags. */
  industryAllowlist: readonly IndustryGroup[] | readonly ["*"];
  /** Included with website plan Layer 1 (no extra line item). */
  includedInWebsite: boolean;
  /** List monthly price INR (0 = free / included). */
  monthlyPrice: number;
  /** List yearly billed total INR (charm …99 when paid). */
  yearlyPrice: number;
  /** Soft caps for this module (plan may still cap further). */
  caps?: {
    links?: number;
    galleryImages?: number;
    mediaKitImages?: number;
  };
  /** MVP ship status for this sprint. */
  status: "shipped" | "stub" | "later";
  enabled: boolean;
};

/** Yearly charm helper: prefer totals ending in 99. */
export function charm99(amount: number): number {
  if (amount <= 0) return 0;
  if (amount % 100 === 99) return amount;
  const base = Math.floor(amount / 100) * 100;
  const candidate = base + 99;
  if (candidate >= amount) return candidate;
  return base + 100 + 99;
}

export function yearlyFromMonthly(monthly: number, yearlyDiscount = 0.08): number {
  if (monthly <= 0) return 0;
  return charm99(Math.round(monthly * 12 * (1 - yearlyDiscount)));
}

export const MODULE_CATALOG: readonly ModuleDef[] = [
  // —— Presence core (MVP W1.A) ——
  {
    sku: "pr.presence_core",
    name: "Presence core",
    description: "Profile site, branding, theme, mobile card layout.",
    category: "presence",
    industryAllowlist: ["presence"],
    includedInWebsite: true,
    monthlyPrice: 0,
    yearlyPrice: 0,
    status: "shipped",
    enabled: true,
  },
  {
    sku: "pr.link_stack",
    name: "Link hub",
    description: "Link buttons, pin/highlight, social strip, reorder.",
    category: "presence",
    industryAllowlist: ["presence"],
    includedInWebsite: true,
    monthlyPrice: 0,
    yearlyPrice: 0,
    caps: { links: 50 },
    status: "shipped",
    enabled: true,
  },
  {
    sku: "pr.gallery",
    name: "Gallery",
    description: "Photo grid for work and events.",
    category: "presence",
    industryAllowlist: ["presence"],
    includedInWebsite: true,
    monthlyPrice: 0,
    yearlyPrice: 0,
    caps: { galleryImages: 24 },
    status: "shipped",
    enabled: true,
  },
  {
    sku: "pr.contact",
    name: "Contact & collab",
    description: "Call, WhatsApp, email, collab form fields.",
    category: "presence",
    industryAllowlist: ["presence"],
    includedInWebsite: true,
    monthlyPrice: 0,
    yearlyPrice: 0,
    status: "shipped",
    enabled: true,
  },
  {
    sku: "pr.share_kit",
    name: "Share kit",
    description: "QR, share/OG card, short public URL.",
    category: "presence",
    industryAllowlist: ["presence"],
    includedInWebsite: true,
    monthlyPrice: 0,
    yearlyPrice: 0,
    status: "shipped",
    enabled: true,
  },
  // —— Creator-strong (next; catalog present) ——
  {
    sku: "pr.media_kit",
    name: "Media kit",
    description: "Media kit + rate card display only (no checkout).",
    category: "presence",
    industryAllowlist: ["presence"],
    includedInWebsite: false,
    monthlyPrice: 199,
    yearlyPrice: yearlyFromMonthly(199),
    caps: { mediaKitImages: 12 },
    status: "stub",
    enabled: true,
  },
  {
    sku: "pr.social_proof",
    name: "Social proof",
    description: "Testimonials, brand logos, reach chips.",
    category: "presence",
    industryAllowlist: ["presence"],
    includedInWebsite: false,
    monthlyPrice: 99,
    yearlyPrice: yearlyFromMonthly(99),
    status: "stub",
    enabled: true,
  },
  {
    sku: "pr.highlights",
    name: "Highlights",
    description: "Story-style highlight tiles.",
    category: "presence",
    industryAllowlist: ["presence"],
    includedInWebsite: false,
    monthlyPrice: 99,
    yearlyPrice: yearlyFromMonthly(99),
    status: "stub",
    enabled: true,
  },
  {
    sku: "pr.analytics_lite",
    name: "Analytics lite",
    description: "Page views and link click counts (no visitor PII). Dashboard under Insights.",
    category: "website",
    industryAllowlist: ["*"],
    includedInWebsite: false,
    monthlyPrice: 149,
    yearlyPrice: yearlyFromMonthly(149),
    status: "shipped",
    enabled: true,
  },
  // —— Website pro add-ons (Presence-safe) ——
  {
    sku: "web.custom_domain",
    name: "Custom domain",
    description: "Connect your own domain.",
    category: "website",
    industryAllowlist: ["*"],
    includedInWebsite: false,
    monthlyPrice: 0,
    yearlyPrice: 0,
    status: "stub",
    enabled: true,
  },
  {
    sku: "web.remove_watermark",
    name: "Remove watermark",
    description: "Hide ALINKS watermark on public site.",
    category: "website",
    industryAllowlist: ["*"],
    includedInWebsite: false,
    monthlyPrice: 99,
    yearlyPrice: yearlyFromMonthly(99),
    status: "stub",
    enabled: true,
  },
  // —— Appointments core (W1.B shipped) ——
  {
    sku: "book.appointments_core",
    name: "Appointments core",
    description: "Slots, resources, free client book, calendar holds.",
    category: "booking",
    industryAllowlist: ["salon_beauty", "bookings", "fitness", "education", "automotive", "real_estate"],
    includedInWebsite: true,
    monthlyPrice: 0,
    yearlyPrice: 0,
    status: "shipped",
    enabled: true,
  },
  {
    sku: "book.clinic",
    name: "Clinic pack",
    description: "License gate + patient-facing book fields (no diagnosis storage).",
    category: "booking",
    industryAllowlist: ["bookings"],
    includedInWebsite: true,
    monthlyPrice: 0,
    yearlyPrice: 0,
    status: "shipped",
    enabled: true,
  },
  {
    sku: "book.professional",
    name: "Professional consult",
    description: "Consult service catalogue + free slots.",
    category: "booking",
    industryAllowlist: ["bookings"],
    includedInWebsite: true,
    monthlyPrice: 0,
    yearlyPrice: 0,
    status: "shipped",
    enabled: true,
  },
  {
    sku: "book.venue",
    name: "Venue / banquet",
    description: "Hall packages and date holds (capacity-aware).",
    category: "booking",
    industryAllowlist: ["bookings"],
    includedInWebsite: true,
    monthlyPrice: 0,
    yearlyPrice: 0,
    status: "shipped",
    enabled: true,
  },
  {
    sku: "re.property_bank",
    name: "Property-Bank",
    description: "Listings sell/rent/lease with open/teaser/private visibility + leads.",
    category: "ops",
    industryAllowlist: ["real_estate"],
    includedInWebsite: true,
    monthlyPrice: 0,
    yearlyPrice: 0,
    status: "shipped",
    enabled: true,
  },
  {
    sku: "edu.courses",
    name: "Courses catalogue",
    description: "Course / class / program list with optional fees display.",
    category: "ops",
    industryAllowlist: ["education"],
    includedInWebsite: true,
    monthlyPrice: 0,
    yearlyPrice: 0,
    status: "shipped",
    enabled: true,
  },
  {
    sku: "edu.enquiry",
    name: "Education enquiry",
    description: "Free demo / admissions enquiry to tenant Sheets.",
    category: "ops",
    industryAllowlist: ["education"],
    includedInWebsite: true,
    monthlyPrice: 0,
    yearlyPrice: 0,
    status: "shipped",
    enabled: true,
  },
  {
    sku: "edu.media_youtube",
    name: "YouTube on site",
    description: "YouTube embeds only — free with website (no other video hosts).",
    category: "ops",
    industryAllowlist: ["education"],
    includedInWebsite: true,
    monthlyPrice: 0,
    yearlyPrice: 0,
    status: "shipped",
    enabled: true,
  },
  {
    sku: "edu.live_tuition_slots",
    name: "Live tuition slots",
    description: "1:1 / batch slots via appointments (later).",
    category: "booking",
    industryAllowlist: ["education"],
    includedInWebsite: false,
    monthlyPrice: 199,
    yearlyPrice: yearlyFromMonthly(199),
    status: "later",
    enabled: true,
  },
  {
    sku: "fit.memberships",
    name: "Memberships",
    description: "Membership plans display + enquiry / book interest.",
    category: "booking",
    industryAllowlist: ["fitness"],
    includedInWebsite: true,
    monthlyPrice: 0,
    yearlyPrice: 0,
    status: "shipped",
    enabled: true,
  },
  {
    sku: "fit.classes",
    name: "Group classes",
    description: "Class schedule lite + capacity-aware slots.",
    category: "booking",
    industryAllowlist: ["fitness"],
    includedInWebsite: true,
    monthlyPrice: 0,
    yearlyPrice: 0,
    status: "shipped",
    enabled: true,
  },
  {
    sku: "fit.trial_booking",
    name: "Trial / class booking",
    description: "Free trial and class slots via appointments core.",
    category: "booking",
    industryAllowlist: ["fitness"],
    includedInWebsite: true,
    monthlyPrice: 0,
    yearlyPrice: 0,
    status: "shipped",
    enabled: true,
  },
  {
    sku: "fit.pt_packages",
    name: "PT packages",
    description: "Personal training session packs.",
    category: "booking",
    industryAllowlist: ["fitness"],
    includedInWebsite: true,
    monthlyPrice: 0,
    yearlyPrice: 0,
    status: "shipped",
    enabled: true,
  },
  {
    sku: "fit.fees_pay",
    name: "Fitness fees pay",
    description: "Optional online membership fee (tenant PG) — later.",
    category: "booking",
    industryAllowlist: ["fitness"],
    includedInWebsite: false,
    monthlyPrice: 199,
    yearlyPrice: yearlyFromMonthly(199),
    status: "later",
    enabled: true,
  },
  {
    sku: "auto.vehicle_listings",
    name: "Vehicle listings",
    description: "Showcase inventory + enquiry (no car checkout on ALINKS).",
    category: "ops",
    industryAllowlist: ["automotive"],
    includedInWebsite: true,
    monthlyPrice: 0,
    yearlyPrice: 0,
    status: "shipped",
    enabled: true,
  },
  {
    sku: "auto.leads",
    name: "Auto leads",
    description: "Test drive / buy / service interest to tenant Sheets.",
    category: "ops",
    industryAllowlist: ["automotive"],
    includedInWebsite: true,
    monthlyPrice: 0,
    yearlyPrice: 0,
    status: "shipped",
    enabled: true,
  },
  {
    sku: "auto.service_packages",
    name: "Service packages",
    description: "Workshop / detailing packages for slot booking.",
    category: "booking",
    industryAllowlist: ["automotive"],
    includedInWebsite: true,
    monthlyPrice: 0,
    yearlyPrice: 0,
    status: "shipped",
    enabled: true,
  },
  {
    sku: "auto.service_booking",
    name: "Service booking",
    description: "Workshop slots via appointments core (free book OK).",
    category: "booking",
    industryAllowlist: ["automotive"],
    includedInWebsite: true,
    monthlyPrice: 0,
    yearlyPrice: 0,
    status: "shipped",
    enabled: true,
  },
  {
    sku: "auto.parts_retail",
    name: "Parts retail",
    description: "Spare parts catalogue (retail storefront pattern).",
    category: "commerce",
    industryAllowlist: ["automotive"],
    includedInWebsite: false,
    monthlyPrice: 199,
    yearlyPrice: yearlyFromMonthly(199),
    status: "shipped",
    enabled: true,
  },
  {
    sku: "sb.packages",
    name: "Salon packages",
    description: "Service package catalogue for salon & beauty.",
    category: "booking",
    industryAllowlist: ["salon_beauty"],
    includedInWebsite: true,
    monthlyPrice: 0,
    yearlyPrice: 0,
    status: "shipped",
    enabled: true,
  },
  {
    sku: "sb.staff_roster",
    name: "Staff roster",
    description: "Light staff list with slot capacity.",
    category: "booking",
    industryAllowlist: ["salon_beauty", "bookings"],
    includedInWebsite: true,
    monthlyPrice: 0,
    yearlyPrice: 0,
    status: "shipped",
    enabled: true,
  },
  {
    sku: "sb.pay_then_book",
    name: "Pay then book",
    description: "15-min soft hold + tenant Razorpay before slot confirms (optional per package).",
    category: "booking",
    industryAllowlist: ["salon_beauty"],
    includedInWebsite: false,
    monthlyPrice: 199,
    yearlyPrice: yearlyFromMonthly(199),
    status: "shipped",
    enabled: true,
  },
  {
    sku: "food.menu_display",
    name: "Menu display",
    description: "Digital menu on site + WhatsApp order CTA (Layer 1).",
    category: "commerce",
    industryAllowlist: ["food"],
    includedInWebsite: true,
    monthlyPrice: 0,
    yearlyPrice: 0,
    status: "shipped",
    enabled: true,
  },
  {
    sku: "food.dine_in",
    name: "Restaurant dine-in",
    description: "Table QR ordering — restaurant only (never cloud kitchen).",
    category: "commerce",
    industryAllowlist: ["food"],
    includedInWebsite: false,
    monthlyPrice: 399,
    yearlyPrice: yearlyFromMonthly(399),
    status: "shipped",
    enabled: true,
  },
  {
    sku: "food.pickup",
    name: "Pickup orders",
    description: "Order online, collect at counter — ticket board.",
    category: "commerce",
    industryAllowlist: ["food"],
    includedInWebsite: false,
    monthlyPrice: 199,
    yearlyPrice: yearlyFromMonthly(199),
    status: "shipped",
    enabled: true,
  },
  {
    sku: "food.delivery",
    name: "Delivery orders",
    description: "Delivery channel + order board (tenant riders — not Artix fleet).",
    category: "commerce",
    industryAllowlist: ["food"],
    includedInWebsite: false,
    monthlyPrice: 299,
    yearlyPrice: yearlyFromMonthly(299),
    status: "shipped",
    enabled: true,
  },
  {
    sku: "retail.storefront",
    name: "Storefront",
    description: "Product grid, category/brand filters, WhatsApp or cart order.",
    category: "commerce",
    industryAllowlist: ["retail"],
    includedInWebsite: true,
    monthlyPrice: 0,
    yearlyPrice: 0,
    status: "shipped",
    enabled: true,
  },
  {
    sku: "retail.wholesale_b2b",
    name: "Wholesale B2B",
    description: "MOQ and bulk tiers (later). Not multi-outlet POS.",
    category: "commerce",
    industryAllowlist: ["retail"],
    includedInWebsite: false,
    monthlyPrice: 399,
    yearlyPrice: yearlyFromMonthly(399),
    status: "later",
    enabled: true,
  },
] as const;

const BY_SKU = new Map(MODULE_CATALOG.map((m) => [m.sku, m]));

export function getModule(sku: string): ModuleDef | undefined {
  return BY_SKU.get(sku);
}

export function modulesForIndustry(group: IndustryGroup | string): ModuleDef[] {
  const g = group as IndustryGroup;
  return MODULE_CATALOG.filter((m) => {
    if (!m.enabled) return false;
    const allow = m.industryAllowlist;
    if (allow.includes("*" as never)) return true;
    return (allow as readonly string[]).includes(g);
  });
}

export function selectableModulesForIndustry(group: IndustryGroup | string): ModuleDef[] {
  return modulesForIndustry(group).filter((m) => !m.includedInWebsite && m.status !== "later");
}

export function hasModuleSku(entitledSkus: readonly string[], sku: string): boolean {
  return entitledSkus.includes(sku);
}
