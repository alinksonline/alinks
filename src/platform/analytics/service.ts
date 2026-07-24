import { and, desc, eq, gte } from "drizzle-orm";
import {
  ANALYTICS_DASHBOARD_DAYS,
  ANALYTICS_LITE_SKU,
  isAnalyticsEventType,
  normalizeAnalyticsPathKey,
  utcDayString,
  type AnalyticsEventType,
} from "@/core/config/analytics";
import { hasModule } from "@/platform/billing/entitlements";
import { getPlatformDb } from "@/platform/db/client";
import { analyticsDaily, businesses } from "@/platform/db/schema";

export type AnalyticsSummary = {
  days: number;
  pageViews: number;
  linkClicks: number;
  byDay: { day: string; pageViews: number; linkClicks: number }[];
  topPaths: { pathKey: string; count: number }[];
  topLinks: { pathKey: string; count: number }[];
};

/** Resolve published business id by handle; null if missing. */
export async function resolvePublishedBusinessId(handle: string): Promise<string | null> {
  const db = getPlatformDb();
  if (!db || !handle.trim()) return null;
  const row = (
    await db
      .select({ id: businesses.id, isPublished: businesses.isPublished })
      .from(businesses)
      .where(eq(businesses.handle, handle.trim().toLowerCase()))
      .limit(1)
  )[0];
  // Handles are case-sensitive in schema — try exact if lower miss
  if (!row) {
    const exact = (
      await db
        .select({ id: businesses.id, isPublished: businesses.isPublished })
        .from(businesses)
        .where(eq(businesses.handle, handle.trim()))
        .limit(1)
    )[0];
    if (!exact?.isPublished) return null;
    return exact.id;
  }
  if (!row.isPublished) return null;
  return row.id;
}

export async function businessHasAnalyticsLite(businessId: string): Promise<boolean> {
  return hasModule(businessId, ANALYTICS_LITE_SKU);
}

/**
 * Increment daily aggregate. No-ops if module not entitled or DB down.
 * Never stores IP, UA, name, or phone.
 */
export async function recordAnalyticsEvent(input: {
  businessId: string;
  eventType: string;
  pathOrLink: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isAnalyticsEventType(input.eventType)) {
    return { ok: false, error: "Invalid event type" };
  }
  const db = getPlatformDb();
  if (!db) return { ok: false, error: "Database not connected" };

  if (!(await businessHasAnalyticsLite(input.businessId))) {
    // Silent skip for clients without module — not an error for beacons
    return { ok: true };
  }

  const pathKey = normalizeAnalyticsPathKey(input.pathOrLink, input.eventType);
  const day = utcDayString();
  const eventType: AnalyticsEventType = input.eventType;

  // Upsert: try update, else insert
  const existing = (
    await db
      .select({ id: analyticsDaily.id, count: analyticsDaily.count })
      .from(analyticsDaily)
      .where(
        and(
          eq(analyticsDaily.businessId, input.businessId),
          eq(analyticsDaily.day, day),
          eq(analyticsDaily.eventType, eventType),
          eq(analyticsDaily.pathKey, pathKey),
        ),
      )
      .limit(1)
  )[0];

  if (existing) {
    await db
      .update(analyticsDaily)
      .set({ count: existing.count + 1, updatedAt: new Date() })
      .where(eq(analyticsDaily.id, existing.id));
  } else {
    await db.insert(analyticsDaily).values({
      businessId: input.businessId,
      day,
      eventType,
      pathKey,
      count: 1,
    });
  }

  return { ok: true };
}

export async function getAnalyticsSummary(
  businessId: string,
  days = ANALYTICS_DASHBOARD_DAYS,
): Promise<AnalyticsSummary> {
  const empty: AnalyticsSummary = {
    days,
    pageViews: 0,
    linkClicks: 0,
    byDay: [],
    topPaths: [],
    topLinks: [],
  };

  const db = getPlatformDb();
  if (!db) return empty;

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - (days - 1));
  const sinceDay = utcDayString(since);

  const rows = await db
    .select()
    .from(analyticsDaily)
    .where(and(eq(analyticsDaily.businessId, businessId), gte(analyticsDaily.day, sinceDay)))
    .orderBy(desc(analyticsDaily.day));

  let pageViews = 0;
  let linkClicks = 0;
  const dayMap = new Map<string, { pageViews: number; linkClicks: number }>();
  const pathMap = new Map<string, number>();
  const linkMap = new Map<string, number>();

  for (const r of rows) {
    const day = String(r.day);
    const bucket = dayMap.get(day) ?? { pageViews: 0, linkClicks: 0 };
    if (r.eventType === "page_view") {
      pageViews += r.count;
      bucket.pageViews += r.count;
      pathMap.set(r.pathKey, (pathMap.get(r.pathKey) ?? 0) + r.count);
    } else if (r.eventType === "link_click") {
      linkClicks += r.count;
      bucket.linkClicks += r.count;
      linkMap.set(r.pathKey, (linkMap.get(r.pathKey) ?? 0) + r.count);
    }
    dayMap.set(day, bucket);
  }

  const byDay = Array.from(dayMap.entries())
    .map(([day, v]) => ({ day, ...v }))
    .sort((a, b) => a.day.localeCompare(b.day));

  const topPaths = Array.from(pathMap.entries())
    .map(([pathKey, count]) => ({ pathKey, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topLinks = Array.from(linkMap.entries())
    .map(([pathKey, count]) => ({ pathKey, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return { days, pageViews, linkClicks, byDay, topPaths, topLinks };
}
