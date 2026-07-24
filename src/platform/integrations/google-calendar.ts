/**
 * Google Calendar for tenants — FREE capability (not a paid SKU).
 * Live OAuth: create events + FreeBusy for public booking slots.
 * Stub connect only in non-production for demos.
 */

import { eq } from "drizzle-orm";
import { buildGoogleEventTimeRange, busyIntervalToOccupied } from "@/core/utils/google-calendar-slots";
import type { OccupiedSlot } from "@/core/utils/appointment-slots";
import { refreshGoogleAccessToken } from "@/platform/auth/google-calendar-oauth";
import { getPlatformDb } from "@/platform/db/client";
import { googleCalendarConnectors } from "@/platform/db/schema";
import { decryptSecret, encryptSecret } from "@/platform/payments/secret-box";

export type CalendarConnectorStatus = {
  connected: boolean;
  googleEmail: string | null;
  connectionMode: "stub" | "oauth" | string;
  calendarId: string | null;
  lastSyncAt: Date | null;
  lastError: string | null;
  free: true;
  oauthConfigured: boolean;
};

export async function getGoogleCalendarStatus(businessId: string): Promise<CalendarConnectorStatus> {
  const { isGoogleCalendarOAuthConfigured } = await import("@/platform/auth/google-calendar-oauth");
  const oauthConfigured = isGoogleCalendarOAuthConfigured();

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
      oauthConfigured,
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
    oauthConfigured,
  };
}

/**
 * Stub Connect for local/dev until Google OAuth env is set (or for demos).
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
        refreshTokenEnc: null,
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

/** Persist live OAuth connection (encrypted refresh token). */
export async function saveGoogleCalendarOAuthConnection(input: {
  businessId: string;
  googleEmail: string;
  refreshToken: string | null | undefined;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = getPlatformDb();
  if (!db) return { ok: false, error: "Database not connected" };

  if (!input.refreshToken?.trim()) {
    return {
      ok: false,
      error:
        "Google did not return a refresh token. Disconnect the app from your Google Account permissions and try Connect again (consent screen).",
    };
  }

  const enc = encryptSecret(input.refreshToken.trim());
  const existing = (
    await db
      .select()
      .from(googleCalendarConnectors)
      .where(eq(googleCalendarConnectors.businessId, input.businessId))
      .limit(1)
  )[0];

  if (existing) {
    await db
      .update(googleCalendarConnectors)
      .set({
        isActive: true,
        connectionMode: "oauth",
        googleEmail: input.googleEmail,
        refreshTokenEnc: enc,
        calendarId: "primary",
        connectedAt: new Date(),
        lastError: null,
        updatedAt: new Date(),
      })
      .where(eq(googleCalendarConnectors.id, existing.id));
  } else {
    await db.insert(googleCalendarConnectors).values({
      businessId: input.businessId,
      isActive: true,
      connectionMode: "oauth",
      googleEmail: input.googleEmail,
      refreshTokenEnc: enc,
      calendarId: "primary",
      connectedAt: new Date(),
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

async function getLiveAccessToken(
  businessId: string,
): Promise<
  | { ok: true; accessToken: string; calendarId: string; connectorId: string }
  | { ok: false; reason: string }
> {
  const db = getPlatformDb();
  if (!db) return { ok: false, reason: "no_db" };

  const row = (
    await db
      .select()
      .from(googleCalendarConnectors)
      .where(eq(googleCalendarConnectors.businessId, businessId))
      .limit(1)
  )[0];

  if (!row?.isActive) return { ok: false, reason: "not_connected" };
  if (row.connectionMode !== "oauth" || !row.refreshTokenEnc) {
    return { ok: false, reason: "stub_or_no_token" };
  }

  try {
    const refreshToken = decryptSecret(row.refreshTokenEnc);
    const refreshed = await refreshGoogleAccessToken(refreshToken);
    if (!refreshed.ok || !refreshed.accessToken) {
      await db
        .update(googleCalendarConnectors)
        .set({
          lastError: refreshed.error ?? "Could not refresh Google token",
          updatedAt: new Date(),
        })
        .where(eq(googleCalendarConnectors.id, row.id));
      return { ok: false, reason: "refresh_failed" };
    }
    return {
      ok: true,
      accessToken: refreshed.accessToken,
      calendarId: row.calendarId || "primary",
      connectorId: row.id,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Token error";
    await db
      .update(googleCalendarConnectors)
      .set({ lastError: msg, updatedAt: new Date() })
      .where(eq(googleCalendarConnectors.id, row.id));
    return { ok: false, reason: "decrypt_failed" };
  }
}

/**
 * Query Google FreeBusy for a day — merge into ALINKS slot engine as occupied.
 * No customer PII. Best-effort; returns [] if not live-connected.
 */
export async function listGoogleBusyOccupiedSlots(
  businessId: string,
  isoDate: string,
): Promise<OccupiedSlot[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return [];

  const auth = await getLiveAccessToken(businessId);
  if (!auth.ok) return [];

  const timeMin = `${isoDate}T00:00:00+05:30`;
  const timeMax = `${isoDate}T23:59:59+05:30`;

  try {
    const res = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeMin,
        timeMax,
        timeZone: "Asia/Kolkata",
        items: [{ id: auth.calendarId }],
      }),
    });

    const json = (await res.json()) as {
      calendars?: Record<string, { busy?: { start: string; end: string }[]; errors?: unknown[] }>;
      error?: { message?: string };
    };

    if (!res.ok) {
      const db = getPlatformDb();
      if (db) {
        await db
          .update(googleCalendarConnectors)
          .set({
            lastError: json.error?.message ?? `FreeBusy ${res.status}`,
            updatedAt: new Date(),
          })
          .where(eq(googleCalendarConnectors.id, auth.connectorId));
      }
      return [];
    }

    const calKey = Object.keys(json.calendars ?? {})[0];
    const busy = (calKey && json.calendars?.[calKey]?.busy) || [];
    const occupied: OccupiedSlot[] = [];
    for (const b of busy) {
      const occ = busyIntervalToOccupied(isoDate, b.start, b.end);
      if (occ) {
        occupied.push({
          slotDate: occ.slotDate,
          slotTime: occ.slotTime,
          durationMinutes: occ.durationMinutes,
          capacityUsed: 1,
        });
      }
    }

    const db = getPlatformDb();
    if (db) {
      await db
        .update(googleCalendarConnectors)
        .set({ lastSyncAt: new Date(), lastError: null, updatedAt: new Date() })
        .where(eq(googleCalendarConnectors.id, auth.connectorId));
    }

    return occupied;
  } catch {
    return [];
  }
}

/**
 * Push confirmed booking to Google Calendar when connected.
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

  // Stub: no outbound call
  if (row.connectionMode === "stub" || !row.refreshTokenEnc) {
    const eventId = `stub-${input.bookingId.slice(0, 8)}`;
    await db
      .update(googleCalendarConnectors)
      .set({ lastSyncAt: new Date(), lastError: null, updatedAt: new Date() })
      .where(eq(googleCalendarConnectors.id, row.id));
    return { eventId, mode: "stub" };
  }

  try {
    const auth = await getLiveAccessToken(input.businessId);
    if (!auth.ok) {
      return { eventId: null, mode: "oauth_error" };
    }

    const range = buildGoogleEventTimeRange(
      input.slotDate,
      input.slotTime,
      input.durationMinutes,
    );
    if (!range) {
      await db
        .update(googleCalendarConnectors)
        .set({ lastError: "Invalid slot date/time", updatedAt: new Date() })
        .where(eq(googleCalendarConnectors.id, row.id));
      return { eventId: null, mode: "oauth_error" };
    }

    const calendarId = encodeURIComponent(auth.calendarId);
    const summary = input.packageName;
    const description = [
      `ALINKS booking ${input.bookingId}`,
      input.staffName ? `Staff: ${input.staffName}` : null,
      "Customer details are in your ALINKS data sheet (not on this event for privacy).",
    ]
      .filter(Boolean)
      .join("\n");

    const eventRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary,
          description,
          start: range.start,
          end: range.end,
        }),
      },
    );

    const eventJson = (await eventRes.json()) as { id?: string; error?: { message?: string } };
    if (!eventRes.ok || !eventJson.id) {
      const msg = eventJson.error?.message ?? `Calendar API ${eventRes.status}`;
      await db
        .update(googleCalendarConnectors)
        .set({ lastError: msg, updatedAt: new Date() })
        .where(eq(googleCalendarConnectors.id, row.id));
      return { eventId: null, mode: "oauth_error" };
    }

    await db
      .update(googleCalendarConnectors)
      .set({ lastSyncAt: new Date(), lastError: null, updatedAt: new Date() })
      .where(eq(googleCalendarConnectors.id, row.id));

    return { eventId: eventJson.id, mode: "oauth" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Calendar push failed";
    await db
      .update(googleCalendarConnectors)
      .set({ lastError: msg, updatedAt: new Date() })
      .where(eq(googleCalendarConnectors.id, row.id));
    return { eventId: null, mode: "oauth_error" };
  }
}
