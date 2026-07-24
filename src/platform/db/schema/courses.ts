import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { businesses } from "./businesses";

/**
 * Education course catalogue (Layer 1).
 * Student/parent PII → tenant Sheets via enquiry. Video = YouTube only.
 */
export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description"),
  /** Open taxonomy subject/skill e.g. Maths, Guitar, Coding */
  subject: varchar("subject", { length: 80 }).notNull().default("General"),
  /** school | tuition | skill | tutorial | other */
  mode: varchar("mode", { length: 40 }).notNull().default("tuition"),
  feeLabel: varchar("fee_label", { length: 80 }),
  feeAmount: integer("fee_amount"),
  /** Validated YouTube URL only */
  youtubeUrl: text("youtube_url"),
  youtubeVideoId: varchar("youtube_video_id", { length: 20 }),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
