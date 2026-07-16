import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { businesses } from "./businesses";

/**
 * Retail product catalog (platform config).
 * Customer orders → tenant Sheets / checkout — not Artix GMV settlement.
 * No multi-outlet POS product.
 */
export const storeProducts = pgTable("store_products", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description"),
  price: integer("price").notNull().default(0),
  mrp: integer("mrp"),
  category: varchar("category", { length: 80 }).notNull().default("General"),
  /** Optional brand tag for multi-brand shops */
  brand: varchar("brand", { length: 80 }),
  sku: varchar("sku", { length: 64 }),
  stock: integer("stock"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
