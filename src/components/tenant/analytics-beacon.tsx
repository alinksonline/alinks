"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Fire-and-forget page view + delegated link-click tracking.
 * Only runs when the tenant has Analytics lite entitled (server no-ops otherwise).
 * Never sends name, phone, or free-text form data.
 */
export function AnalyticsBeacon({
  handle,
  enabled,
}: {
  handle: string;
  /** Server-side hasModule(pr.analytics_lite). */
  enabled: boolean;
}) {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !handle) return;

    // Path relative to handle for cleaner keys, e.g. /menu not /cafe/menu
    const path = stripHandle(pathname, handle);
    if (lastPath.current === path) return;
    lastPath.current = path;

    void fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle, eventType: "page_view", path }),
      keepalive: true,
    }).catch(() => {
      /* ignore */
    });
  }, [enabled, handle, pathname]);

  useEffect(() => {
    if (!enabled || !handle) return;

    function onClick(e: MouseEvent) {
      const el = (e.target as HTMLElement | null)?.closest?.("a[data-analytics-link], a[href]");
      if (!el || !(el instanceof HTMLAnchorElement)) return;

      // Only track outbound or explicit data-analytics-link
      const marked = el.hasAttribute("data-analytics-link");
      const href = el.getAttribute("href") ?? "";
      if (!marked && !isTrackableHref(href)) return;

      const key =
        el.getAttribute("data-analytics-link") ||
        el.getAttribute("data-link-id") ||
        href.slice(0, 120);

      void fetch("/api/analytics/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle,
          eventType: "link_click",
          path: key,
        }),
        keepalive: true,
      }).catch(() => {
        /* ignore */
      });
    }

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [enabled, handle]);

  return null;
}

function stripHandle(pathname: string, handle: string): string {
  const prefix = `/${handle}`;
  if (pathname === prefix || pathname === `${prefix}/`) return "/";
  if (pathname.startsWith(`${prefix}/`)) {
    return pathname.slice(prefix.length) || "/";
  }
  return pathname || "/";
}

function isTrackableHref(href: string): boolean {
  if (!href || href.startsWith("#") || href.startsWith("javascript:")) return false;
  // External or WhatsApp / tel / mailto — link hub style
  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("https://wa.me") ||
    href.startsWith("whatsapp:")
  ) {
    return true;
  }
  return false;
}
