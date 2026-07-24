import { integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { businesses } from "./businesses";
import { salonPackages } from "./salon-packages";
import { staffMembers } from "./staff-members";

/**
 * Platform appointment index for schedule/capacity — NO customer PII.
 * Client name/phone live in tenant Sheets (Appointments tab) only.
 */
export const appointmentHolds = pgTable("appointment_holds", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  /** Public booking id (also stored in tenant Sheets). */
  bookingId: uuid("booking_id").notNull().unique(),
  packageId: uuid("package_id").references(() => salonPackages.id, { onDelete: "set null" }),
  packageName: varchar("package_name", { length: 120 }).notNull(),
  staffId: uuid("staff_id").references(() => staffMembers.id, { onDelete: "set null" }),
  staffName: varchar("staff_name", { length: 120 }),
  slotDate: varchar("slot_date", { length: 10 }).notNull(),
  slotTime: varchar("slot_time", { length: 5 }).notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  price: integer("price").notNull().default(0),
  /** free | pay_at_salon | pay_then_book */
  paymentMode: varchar("payment_mode", { length: 20 }).notNull().default("free"),
  /** none | pending | paid | pay_at_salon */
  paymentStatus: varchar("payment_status", { length: 20 }).notNull().default("none"),
  /** confirmed | cancelled | completed | no_show | pending_payment */
  status: varchar("status", { length: 20 }).notNull().default("confirmed"),
  channel: varchar("channel", { length: 20 }).notNull().default("web"),
  googleEventId: varchar("google_event_id", { length: 128 }),
  notes: text("notes"),
  /** Soft hold expiry for pay_then_book (pending_payment). Null = no auto-expire. */
  holdExpiresAt: timestamp("hold_expires_at", { withTimezone: true }),
  checkoutSessionId: uuid("checkout_session_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
