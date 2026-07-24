import { describe, expect, it } from "vitest";
import { shouldShowAlinksWatermark } from "./branding";

describe("shouldShowAlinksWatermark", () => {
  it("shows on basic without module", () => {
    expect(shouldShowAlinksWatermark("basic")).toBe(true);
    expect(shouldShowAlinksWatermark("basic", [])).toBe(true);
  });

  it("hides when remove watermark SKU entitled", () => {
    expect(shouldShowAlinksWatermark("basic", ["web.remove_watermark"])).toBe(false);
  });

  it("hides on pro and enterprise", () => {
    expect(shouldShowAlinksWatermark("pro")).toBe(false);
    expect(shouldShowAlinksWatermark("enterprise")).toBe(false);
  });
});
