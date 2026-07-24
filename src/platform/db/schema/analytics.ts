import { date, integer, pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { businesses } from "./businesses";

/**
 * Aggregated site analytics — no client PII.
 * One row per business + day + event type + path key.
 */
export const analyticsDaily = pgTable(
  "analytics_daily",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    /** Calendar day UTC (YYYY-MM-DD). */
    day: date("day").notNull(),
    /** page_view | link_click */
    eventType: varchar("event_type", { length: 24 }).notNull(),
    /**
     * Path or link key — no query strings with PII.
     * e.g. "/", "/menu", "link:instagram"
     */
    pathKey: varchar("path_key", { length: 160 }).notNull(),
    count: integer("count").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("analytics_daily_biz_day_event_path").on(
      t.businessId,
      t.day,
      t.eventType,
      t.pathKey,
    ),
  ],
);
