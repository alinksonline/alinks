import { describe, expect, it } from "vitest";
import { AI_TIER_LIMITS } from "@/core/config/ai-limits";

describe("AI tier limits", () => {
  it("gives pro more field generates than basic", () => {
    expect(AI_TIER_LIMITS.pro.field_generate).toBeGreaterThan(AI_TIER_LIMITS.basic.field_generate ?? 0);
  });

  it("includes seo_meta for all tiers", () => {
    expect(AI_TIER_LIMITS.basic.seo_meta).toBeDefined();
    expect(AI_TIER_LIMITS.pro.seo_meta).toBeDefined();
  });
});