import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { businesses } from "./businesses";

/**
 * Real estate Property-Bank — listing config only.
 * Leads / buyer PII → tenant Sheets. NO title checkout / escrow.
 */
export const propertyListings = pgTable("property_listings", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description"),
  /** sell | resale | rent | lease */
  listingType: varchar("listing_type", { length: 20 }).notNull().default("sell"),
  /** open | teaser | private */
  visibility: varchar("visibility", { length: 20 }).notNull().default("open"),
  city: varchar("city", { length: 80 }),
  locality: varchar("locality", { length: 120 }),
  priceLabel: varchar("price_label", { length: 80 }),
  /** Optional numeric for filters; display uses priceLabel */
  priceAmount: integer("price_amount"),
  bedrooms: integer("bedrooms"),
  areaSqft: integer("area_sqft"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
