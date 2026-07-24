import { boolean, integer, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const businesses = pgTable("businesses", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  handle: varchar("handle", { length: 30 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  vertical: varchar("vertical", { length: 40 }).notNull().default("general"),
  /**
   * Industry group (presence, salon_beauty, food, …).
   * vertical remains for legacy nav/templates; both stay in sync on write.
   */
  industryGroup: varchar("industry_group", { length: 40 }).notNull().default("general"),
  /** Industry subtype e.g. influencer_creator, salon, cloud_kitchen. */
  industryType: varchar("industry_type", { length: 40 }).notNull().default("general"),
  /**
   * Retail trade mode (frozen labels): retail | wholesale | both.
   * MVP uses retail only on storefront.
   */
  tradeMode: varchar("trade_mode", { length: 20 }).notNull().default("retail"),
  /** Food ops channels (W3.B). Dine-in only meaningful for restaurant types. */
  foodPickupEnabled: boolean("food_pickup_enabled").notNull().default(false),
  foodDeliveryEnabled: boolean("food_delivery_enabled").notNull().default(false),
  foodDineInEnabled: boolean("food_dine_in_enabled").notNull().default(false),
  foodPickupInstructions: text("food_pickup_instructions"),
  foodDeliveryInstructions: text("food_delivery_instructions"),
  /** Creator Partner tier A|B|C|D when deep discount accepted. */
  creatorPartnerTier: varchar("creator_partner_tier", { length: 10 }),
  creatorPartnerAcceptedAt: timestamp("creator_partner_accepted_at", { withTimezone: true }),
  creatorDiscountPctMonthly: integer("creator_discount_pct_monthly"),
  creatorDiscountPctYearly: integer("creator_discount_pct_yearly"),
  isPublished: boolean("is_published").notNull().default(false),
  customDomain: varchar("custom_domain", { length: 255 }),
  googleSpreadsheetId: text("google_spreadsheet_id"),
  storageBackend: varchar("storage_backend", { length: 20 }).notNull().default("google_sheets"),
  themePrimary: varchar("theme_primary", { length: 20 }).notNull().default("#0f172a"),
  themeMode: varchar("theme_mode", { length: 20 }).notNull().default("system"),
  checkoutMode: varchar("checkout_mode", { length: 20 }).notNull().default("lite"),
  codEnabled: boolean("cod_enabled").notNull().default(true),
  customDomainVerified: boolean("custom_domain_verified").notNull().default(false),
  domainVerifyToken: varchar("domain_verify_token", { length: 64 }),
  /**
   * Reserved for optional future Artix-facilitated PayFac / linked accounts (Q005 optional path).
   * Current storefront path uses BYO keys below — do not use this column for live shop checkout.
   */
  razorpaySubMerchantId: varchar("razorpay_sub_merchant_id", { length: 64 }),
  /** Tenant's own Razorpay Key ID (public) — BYO storefront gateway (Q005 dual rail) */
  razorpayKeyId: varchar("razorpay_key_id", { length: 64 }),
  /** AES-GCM encrypted Key Secret — never sent to the browser */
  razorpayKeySecretEnc: text("razorpay_key_secret_enc"),
  razorpayConnectedAt: timestamp("razorpay_connected_at", { withTimezone: true }),
  seoMeta: jsonb("seo_meta").notNull().default({}),
  slotCapacity: integer("slot_capacity").notNull().default(1),
  adsEnabled: boolean("ads_enabled").notNull().default(false),
  verticalGateStatus: varchar("vertical_gate_status", { length: 20 }).notNull().default("approved"),
  pharmacyOtcApproved: boolean("pharmacy_otc_approved").notNull().default(false),
  groceryFreshMode: boolean("grocery_fresh_mode").notNull().default(false),
  metaCatalogEnabled: boolean("meta_catalog_enabled").notNull().default(false),
  templateId: varchar("template_id", { length: 30 }).notNull().default("general"),
  branding: jsonb("branding").notNull().default({}),
  theme: jsonb("theme").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});