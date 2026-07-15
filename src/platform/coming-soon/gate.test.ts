import { describe, expect, it } from "vitest";
import {
  getClientIp,
  isComingSoonApexHost,
  isComingSoonEnabled,
  isComingSoonPathExempt,
  isIpWhitelisted,
  normalizeIp,
  parseWhitelist,
  previewQueryMatches,
} from "./gate";

describe("coming-soon gate", () => {
  it("detects marketing apex hosts only", () => {
    expect(isComingSoonApexHost("alinks.online", "alinks.online", "alinks.online")).toBe(true);
    expect(isComingSoonApexHost("www.alinks.online", "alinks.online", "alinks.online")).toBe(true);
    expect(isComingSoonApexHost("app.alinks.online", "alinks.online", "alinks.online")).toBe(false);
    expect(isComingSoonApexHost("demo.alinks.online", "alinks.online", "alinks.online")).toBe(false);
    expect(isComingSoonApexHost("localhost", "localhost:3000", "localhost:3000")).toBe(false);
  });

  it("exempts coming-soon and health", () => {
    expect(isComingSoonPathExempt("/coming-soon")).toBe(true);
    expect(isComingSoonPathExempt("/api/health")).toBe(true);
    expect(isComingSoonPathExempt("/")).toBe(false);
    expect(isComingSoonPathExempt("/demo")).toBe(false);
  });

  it("parses whitelist and matches IPs", () => {
    const list = parseWhitelist(" 1.2.3.4, 5.6.7.8 ; ::ffff:9.9.9.9 ");
    expect(list).toEqual(["1.2.3.4", "5.6.7.8", "9.9.9.9"]);
    expect(isIpWhitelisted("1.2.3.4", list)).toBe(true);
    expect(isIpWhitelisted("::ffff:1.2.3.4", list)).toBe(true);
    expect(isIpWhitelisted("8.8.8.8", list)).toBe(false);
    expect(isIpWhitelisted(null, list)).toBe(false);
  });

  it("reads client IP from proxy headers", () => {
    const h = new Headers({
      "x-forwarded-for": "203.0.113.10, 10.0.0.1",
      "cf-connecting-ip": "198.51.100.20",
    });
    // Cloudflare header wins
    expect(getClientIp(h)).toBe("198.51.100.20");
    expect(normalizeIp("[2001:db8::1]")).toBe("2001:db8::1");
  });

  it("toggles and preview secret", () => {
    expect(isComingSoonEnabled("true")).toBe(true);
    expect(isComingSoonEnabled("0")).toBe(false);
    const sp = new URLSearchParams("preview=sekrit");
    expect(previewQueryMatches(sp, "sekrit")).toBe(true);
    expect(previewQueryMatches(sp, "nope")).toBe(false);
  });
});
