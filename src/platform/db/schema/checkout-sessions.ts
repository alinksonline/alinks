import { integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { businesses } from "./businesses";

/** Payment refs only — no long-term customer PII */
export const checkoutSessions = pgTable("checkout_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  razorpayOrderId: varchar("razorpay_order_id", { length: 64 }),
  amountPaise: integer("amount_paise").notNull(),
  currency: varchar("currency", { length: 8 }).notNull().default("INR"),
  status: varchar("status", { length: 20 }).notNull().default("created"),
  paymentMethod: varchar("payment_method", { length: 20 }).notNull().default("upi"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});