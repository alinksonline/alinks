import { boolean, integer, pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { businesses } from "./businesses";

/**
 * Tenant module entitlements — has(sku) per business.
 * Modules are priced separately; disable one without cancelling others.
 */
export const tenantModuleEntitlements = pgTable(
  "tenant_module_entitlements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    sku: varchar("sku", { length: 80 }).notNull(),
    enabled: boolean("enabled").notNull().default(true),
    /** onboarding | included | purchase | superadmin | creator_partner */
    source: varchar("source", { length: 40 }).notNull().default("onboarding"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("tenant_module_entitlements_business_sku").on(t.businessId, t.sku)],
);

/** Superadmin price / enable overrides for module catalog SKUs. */
export const modulePriceOverrides = pgTable("module_price_overrides", {
  sku: varchar("sku", { length: 80 }).primaryKey(),
  monthlyPrice: integer("monthly_price"),
  yearlyPrice: integer("yearly_price"),
  enabled: boolean("enabled").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Superadmin industry enable + Creator discount defaults. */
export const industrySettings = pgTable("industry_settings", {
  industryGroup: varchar("industry_group", { length: 40 }).primaryKey(),
  enabled: boolean("enabled").notNull().default(true),
  creatorDiscountPctMonthly: integer("creator_discount_pct_monthly"),
  creatorDiscountPctYearly: integer("creator_discount_pct_yearly"),
  creatorLaunchCoupon: varchar("creator_launch_coupon", { length: 40 }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
