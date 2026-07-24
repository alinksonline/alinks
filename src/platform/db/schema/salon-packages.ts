import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { businesses } from "./businesses";

/** Catalog config in platform DB — booking rows go to tenant storage */
export const salonPackages = pgTable("salon_packages", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  /** salon | beauty | clinic | consult | legal | venue | … */
  category: varchar("category", { length: 20 }).notNull().default("salon"),
  /**
   * How clients pay for this package on the book page:
   * free | pay_at_salon | pay_then_book
   * Default free — Razorpay never required to enable booking.
   */
  paymentMode: varchar("payment_mode", { length: 20 }).notNull().default("free"),
  /** Venue / group capacity (1 = classic 1:1 appointment). */
  capacity: integer("capacity").notNull().default(1),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});