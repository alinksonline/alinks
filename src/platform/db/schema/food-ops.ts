import { boolean, integer, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { businesses } from "./businesses";

/** Restaurant floor tables for dine-in QR (never for cloud kitchen). */
export const foodTables = pgTable("food_tables", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  /** Display e.g. T12 or Patio 3 */
  label: varchar("label", { length: 40 }).notNull(),
  /** Short code in QR URL (unique per business) */
  code: varchar("code", { length: 20 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Food order ticket board (ops index).
 * Customer phone/address also written to tenant Sheets Orders tab.
 * Items stored as JSON lines for kitchen display.
 */
export const foodOrderTickets = pgTable("food_order_tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  orderCode: varchar("order_code", { length: 20 }).notNull(),
  /** pickup | delivery | dine_in | whatsapp */
  channel: varchar("channel", { length: 20 }).notNull(),
  /**
   * new | preparing | ready | out_for_delivery | completed | cancelled
   */
  status: varchar("status", { length: 24 }).notNull().default("new"),
  tableId: uuid("table_id").references(() => foodTables.id, { onDelete: "set null" }),
  tableLabel: varchar("table_label", { length: 40 }),
  /** [{ name, qty, price }] */
  items: jsonb("items").notNull().default([]),
  total: integer("total").notNull().default(0),
  notes: text("notes"),
  /** Optional display name only — full PII in Sheets */
  customerName: varchar("customer_name", { length: 120 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
