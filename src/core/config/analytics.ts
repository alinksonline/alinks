/**
 * Analytics lite — aggregated, anonymous. No client PII.
 * SKU: pr.analytics_lite (Select modules).
 */

export const ANALYTICS_LITE_SKU = "pr.analytics_lite";

export const ANALYTICS_EVENT_TYPES = ["page_view", "link_click"] as const;
export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

/** Max path key length stored. */
export const ANALYTICS_PATH_MAX = 160;

/** How many days the dashboard shows by default. */
export const ANALYTICS_DASHBOARD_DAYS = 30;

/**
 * Normalize a public path or link id for aggregation keys.
 * Strips query/hash (PII risk), lowercases, caps length.
 */
export function normalizeAnalyticsPathKey(raw: string, eventType: AnalyticsEventType): string {
  let s = (raw || "").trim();
  if (!s) return eventType === "page_view" ? "/" : "link:unknown";

  // Link clicks may use "link:slug" or a bare label
  if (eventType === "link_click") {
    if (!s.startsWith("link:")) {
      s = `link:${s}`;
    }
    s = s
      .toLowerCase()
      .replace(/[^a-z0-9:_\-./]/g, "")
      .slice(0, ANALYTICS_PATH_MAX);
    return s || "link:unknown";
  }

  // Page views: path only
  try {
    if (s.startsWith("http://") || s.startsWith("https://")) {
      const u = new URL(s);
      s = u.pathname || "/";
    }
  } catch {
    /* keep raw */
  }

  // Drop query/hash
  s = s.split("?")[0]?.split("#")[0] ?? "/";
  if (!s.startsWith("/")) s = `/${s}`;
  // Collapse multiple slashes
  s = s.replace(/\/+/g, "/");
  // Drop trailing slash except root
  if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
  // Strip handle prefix if client sent full /handle/menu
  // Keep as-is — dashboard shows relative paths as sent
  s = s.toLowerCase().slice(0, ANALYTICS_PATH_MAX);
  return s || "/";
}

export function utcDayString(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function isAnalyticsEventType(v: string): v is AnalyticsEventType {
  return (ANALYTICS_EVENT_TYPES as readonly string[]).includes(v);
}
