import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { businesses } from "./businesses";

/**
 * Automotive vehicle showcase — enquiry only.
 * NO platform car checkout / financing marketplace.
 * Leads → tenant Sheets.
 */
export const vehicleListings = pgTable("vehicle_listings", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description"),
  /** new | used | two_wheeler */
  condition: varchar("condition", { length: 20 }).notNull().default("used"),
  /** open | teaser | private — teaser hides full price */
  visibility: varchar("visibility", { length: 20 }).notNull().default("open"),
  make: varchar("make", { length: 80 }),
  model: varchar("model", { length: 80 }),
  year: integer("year"),
  fuel: varchar("fuel", { length: 40 }),
  kmDriven: integer("km_driven"),
  priceLabel: varchar("price_label", { length: 80 }),
  priceAmount: integer("price_amount"),
  city: varchar("city", { length: 80 }),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
