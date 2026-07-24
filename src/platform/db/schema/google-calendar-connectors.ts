import { boolean, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { businesses } from "./businesses";

/**
 * Tenant Google Calendar Connect — FREE capability (not a paid module).
 * Tokens encrypted at rest when real OAuth is wired; v1 may store connected flag only.
 */
export const googleCalendarConnectors = pgTable("google_calendar_connectors", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" })
    .unique(),
  googleEmail: varchar("google_email", { length: 255 }),
  /** AES-GCM ciphertext when GOOGLE_TOKEN_ENC_KEY set — never log. */
  refreshTokenEnc: text("refresh_token_enc"),
  calendarId: varchar("calendar_id", { length: 255 }).default("primary"),
  isActive: boolean("is_active").notNull().default(false),
  /** stub | oauth — stub means UI connected for demo without live Google API */
  connectionMode: varchar("connection_mode", { length: 20 }).notNull().default("stub"),
  lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
  lastError: text("last_error"),
  connectedAt: timestamp("connected_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
