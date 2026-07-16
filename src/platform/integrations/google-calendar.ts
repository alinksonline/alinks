/**
 * Google Calendar for tenants — FREE capability (not a paid SKU).
 * MVP: connection status + stub push; live OAuth push when refresh token present.
 */

import { eq } from "drizzle-orm";
import { getPlatformDb } from "@/platform/db/client";
import { googleCalendarConnectors } from "@/platform/db/schema";

export type CalendarConnectorStatus = {
  connected: boolean;
  googleEmail: string | null;
  connectionMode: "stub" | "oauth" | string;
  calendarId: string | null;
  lastSyncAt: Date | null;
  lastError: string | null;
  free: true;
};

export async function getGoogleCalendarStatus(businessId: string): Promise<CalendarConnectorStatus> {
  const db = getPlatformDb();
  if (!db) {
    return {
      connected: false,
      googleEmail: null,
      connectionMode: "stub",
      calendarId: null,
      lastSyncAt: null,
      lastError: null,
      free: true,
    };
  }

  const row = (
    await db
      .select()
      .from(googleCalendarConnectors)
      .where(eq(googleCalendarConnectors.businessId, businessId))
      .limit(1)
  )[0];

  return {
    connected: Boolean(row?.isActive),
    googleEmail: row?.googleEmail ?? null,
    connectionMode: row?.connectionMode ?? "stub",
    calendarId: row?.calendarId ?? "primary",
    lastSyncAt: row?.lastSyncAt ?? null,
    lastError: row?.lastError ?? null,
    free: true,
  };
}

/**
 * Stub Connect for local/dev until full tenant Gmail OAuth Calendar scopes ship.
 * Marks calendar as connected without storing secrets.
 */
export async function connectGoogleCalendarStub(
  businessId: string,
  googleEmail?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = getPlatformDb();
  if (!db) return { ok: false, error: "Database not connected" };

  const existing = (
    await db
      .select()
      .from(googleCalendarConnectors)
      .where(eq(googleCalendarConnectors.businessId, businessId))
      .limit(1)
  )[0];

  const email = googleEmail?.trim() || "connected@stub.local";

  if (existing) {
    await db
      .update(googleCalendarConnectors)
      .set({
        isActive: true,
        connectionMode: "stub",
        googleEmail: email,
        connectedAt: new Date(),
        lastError: null,
        updatedAt: new Date(),
      })
      .where(eq(googleCalendarConnectors.id, existing.id));
  } else {
    await db.insert(googleCalendarConnectors).values({
      businessId,
      isActive: true,
      connectionMode: "stub",
      googleEmail: email,
      connectedAt: new Date(),
      calendarId: "primary",
    });
  }

  return { ok: true };
}

export async function disconnectGoogleCalendar(
  businessId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = getPlatformDb();
  if (!db) return { ok: false, error: "Database not connected" };

  const existing = (
    await db
      .select()
      .from(googleCalendarConnectors)
      .where(eq(googleCalendarConnectors.businessId, businessId))
      .limit(1)
  )[0];
  if (!existing) return { ok: true };

  await db
    .update(googleCalendarConnectors)
    .set({
      isActive: false,
      refreshTokenEnc: null,
      lastError: null,
      updatedAt: new Date(),
    })
    .where(eq(googleCalendarConnectors.id, existing.id));

  return { ok: true };
}

/**
 * Push confirmed booking to Google Calendar when connected.
 * Stub mode records lastSyncAt without calling Google APIs.
 * Live OAuth push is next (requires calendar.events scope + refresh token).
 */
export async function tryPushBookingToGoogleCalendar(input: {
  businessId: string;
  bookingId: string;
  packageName: string;
  slotDate: string;
  slotTime: string;
  durationMinutes: number;
  staffName?: string | null;
}): Promise<{ eventId: string | null; mode: string }> {
  const db = getPlatformDb();
  if (!db) return { eventId: null, mode: "none" };

  const row = (
    await db
      .select()
      .from(googleCalendarConnectors)
      .where(eq(googleCalendarConnectors.businessId, input.businessId))
      .limit(1)
  )[0];

  if (!row?.isActive) return { eventId: null, mode: "none" };

  // Stub: no outbound call, synthetic event id for traceability
  if (row.connectionMode === "stub" || !row.refreshTokenEnc) {
    const eventId = `stub-${input.bookingId.slice(0, 8)}`;
    await db
      .update(googleCalendarConnectors)
      .set({ lastSyncAt: new Date(), lastError: null, updatedAt: new Date() })
      .where(eq(googleCalendarConnectors.id, row.id));
    return { eventId, mode: "stub" };
  }

  // Live OAuth path reserved — token decryption + Calendar API insert
  await db
    .update(googleCalendarConnectors)
    .set({
      lastError: "Live Google Calendar push not configured yet — connection saved for free sync later",
      updatedAt: new Date(),
    })
    .where(eq(googleCalendarConnectors.id, row.id));

  return { eventId: null, mode: "oauth_pending" };
}
