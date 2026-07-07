import { describe, expect, it } from "vitest";
import { canUseCustomDomain, canUseProCheckout, canUseSubdomain } from "./tier-gates";

describe("tier gates", () => {
  it("blocks subdomain for basic", () => {
    expect(canUseSubdomain("basic")).toBe(false);
    expect(canUseSubdomain("pro")).toBe(true);
  });

  it("blocks custom domain for basic", () => {
    expect(canUseCustomDomain("basic")).toBe(false);
    expect(canUseCustomDomain("enterprise")).toBe(true);
  });

  it("requires pro tier and checkout mode", () => {
    expect(canUseProCheckout("basic", "pro")).toBe(false);
    expect(canUseProCheckout("pro", "lite")).toBe(false);
    expect(canUseProCheckout("pro", "pro")).toBe(true);
  });
});
