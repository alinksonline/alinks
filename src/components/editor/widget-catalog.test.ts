import { describe, expect, it } from "vitest";
import { createBlock, WIDGET_CATALOG } from "./widget-catalog";

describe("widget catalog", () => {
  it("exposes a curated fixed widget list", () => {
    expect(WIDGET_CATALOG.length).toBeGreaterThanOrEqual(8);
    const types = WIDGET_CATALOG.map((w) => w.type);
    expect(types).toContain("whatsapp");
    expect(types).toContain("link");
    expect(types).toContain("services");
  });

  it("creates valid blocks for every widget type", () => {
    for (const w of WIDGET_CATALOG) {
      const block = createBlock(w.type);
      expect(block.id).toBeTruthy();
      expect(block.type).toBe(w.type);
      expect(block.visible).toBe(true);
      expect(block.title.length).toBeGreaterThan(0);
    }
  });
});
