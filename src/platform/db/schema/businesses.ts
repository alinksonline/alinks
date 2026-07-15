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
  razorpaySubMerchantId: varchar("razorpay_sub_merchant_id", { length: 64 }),
  /** Tenant's own Razorpay Key ID (public) — BYO gateway, not Artix facilitation */
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