import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { businesses } from "./businesses";

export const clinicLicenses = pgTable("clinic_licenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  licenseNumber: varchar("license_number", { length: 64 }).notNull(),
  doctorName: varchar("doctor_name", { length: 120 }).notNull(),
  council: varchar("council", { length: 80 }).notNull().default("NMC"),
  documentUrl: text("document_url"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});