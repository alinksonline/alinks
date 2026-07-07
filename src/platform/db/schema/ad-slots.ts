import { boolean, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { businesses } from "./businesses";

export const adSlots = pgTable("ad_slots", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").references(() => businesses.id, { onDelete: "set null" }),
  placement: varchar("placement", { length: 40 }).notNull().default("tenant_footer"),
  advertiser: varchar("advertiser", { length: 120 }).notNull(),
  creativeUrl: text("creative_url"),
  targetUrl: text("target_url").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});