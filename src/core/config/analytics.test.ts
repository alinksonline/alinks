import { describe, expect, it } from "vitest";
import {
  isAnalyticsEventType,
  normalizeAnalyticsPathKey,
  utcDayString,
} from "./analytics";

describe("analytics lite helpers", () => {
  it("normalizes page paths", () => {
    expect(normalizeAnalyticsPathKey("/", "page_view")).toBe("/");
    expect(normalizeAnalyticsPathKey("/Menu/", "page_view")).toBe("/menu");
    expect(normalizeAnalyticsPathKey("/store?utm=x#top", "page_view")).toBe("/store");
    expect(normalizeAnalyticsPathKey("https://example.com/book", "page_view")).toBe("/book");
  });

  it("normalizes link keys", () => {
    expect(normalizeAnalyticsPathKey("instagram", "link_click")).toBe("link:instagram");
    expect(normalizeAnalyticsPathKey("link:wa", "link_click")).toBe("link:wa");
    expect(normalizeAnalyticsPathKey("https://wa.me/91", "link_click")).toMatch(/^link:/);
  });

  it("validates event types", () => {
    expect(isAnalyticsEventType("page_view")).toBe(true);
    expect(isAnalyticsEventType("link_click")).toBe(true);
    expect(isAnalyticsEventType("identify")).toBe(false);
  });

  it("utc day is ISO date", () => {
    expect(utcDayString(new Date("2026-07-17T12:00:00Z"))).toBe("2026-07-17");
  });
});
