import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { businesses } from "./businesses";

/**
 * Food menu catalog (Layer 1) — config in platform DB.
 * Customer orders go via WhatsApp, not cart checkout, on Layer 1.
 */
export const menuItems = pgTable("menu_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description"),
  /** Menu section e.g. Starters, Mains, Breads */
  section: varchar("section", { length: 60 }).notNull().default("Mains"),
  price: integer("price").notNull().default(0),
  isVeg: boolean("is_veg").notNull().default(true),
  isAvailable: boolean("is_available").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
