import { boolean, integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

/** Artix platform: tenant accounts only — NO client/customer PII */
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 120 }),
  /** Platform account role: tenant = client, superadmin = Artix operator (DB source of truth) */
  role: varchar("role", { length: 20 }).notNull().default("tenant"),
  tier: varchar("tier", { length: 20 }).notNull().default("basic"),
  status: varchar("status", { length: 20 }).notNull().default("trial"),
  trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
  aiCredits: integer("ai_credits").notNull().default(0),
  locale: varchar("locale", { length: 10 }).notNull().default("en"),
  region: varchar("region", { length: 4 }).notNull().default("IN"),
  adsOptIn: boolean("ads_opt_in").notNull().default(false),
  activeBusinessId: uuid("active_business_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});