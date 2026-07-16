import { boolean, integer, jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { businesses } from "./businesses";

export const staffMembers = pgTable("staff_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  role: varchar("role", { length: 40 }).notNull().default("stylist"),
  slotCapacity: integer("slot_capacity").notNull().default(1),
  /** Optional per-staff weekly hours override (WeeklyHours JSON). Null = business default. */
  weeklyHours: jsonb("weekly_hours"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});