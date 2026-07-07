import { boolean, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { businesses } from "./businesses";

/** Connection refs only — tenant BYO Supabase credentials */
export const supabaseConnectors = pgTable("supabase_connectors", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  projectUrl: text("project_url").notNull(),
  anonKeyRef: varchar("anon_key_ref", { length: 64 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});