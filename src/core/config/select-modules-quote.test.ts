import { describe, expect, it } from "vitest";
import { MODULE_CATALOG } from "./modules";
import {
  applyPctOff,
  buildSelectModulesQuote,
  moduleEligibleForCreatorDiscount,
  resolveCreatorDiscountPct,
} from "./select-modules-quote";

describe("select modules quote", () => {
  it("applies pct off correctly", () => {
    expect(applyPctOff(1000, 0)).toBe(1000);
    expect(applyPctOff(1000, 50)).toBe(500);
    expect(applyPctOff(1000, 100)).toBe(0);
    expect(applyPctOff(0, 50)).toBe(0);
  });

  it("resolves Creator Partner tier B yearly discount", () => {
    const pct = resolveCreatorDiscountPct("annual", {
      partnerTier: "B",
      industryGroup: "presence",
    });
    expect(pct).toBe(60);
  });

  it("never applies creator discount outside presence", () => {
    const pct = resolveCreatorDiscountPct("monthly", {
      partnerTier: "A",
      discountPctMonthly: 90,
      industryGroup: "food",
    });
    expect(pct).toBe(0);
  });

  it("prefers business override over tier ladder", () => {
    const pct = resolveCreatorDiscountPct("monthly", {
      partnerTier: "A",
      discountPctMonthly: 10,
      industryGroup: "presence",
    });
    expect(pct).toBe(10);
  });

  it("marks presence and website modules for creator discount", () => {
    expect(moduleEligibleForCreatorDiscount({ category: "presence" })).toBe(true);
    expect(moduleEligibleForCreatorDiscount({ category: "website" })).toBe(true);
    expect(moduleEligibleForCreatorDiscount({ category: "commerce" })).toBe(false);
  });

  it("builds invoice: website plan + selected paid modules only", () => {
    const quote = buildSelectModulesQuote({
      tier: "pro",
      cycle: "monthly",
      selectedSkus: ["food.pickup", "food.delivery"],
      catalog: MODULE_CATALOG as unknown as Parameters<typeof buildSelectModulesQuote>[0]["catalog"],
      creator: { industryGroup: "food" },
      applyFoodOpsBundle: false,
    });

    expect(quote.lines[0]?.kind).toBe("website_plan");
    expect(quote.lines.some((l) => l.sku === "food.pickup")).toBe(true);
    expect(quote.lines.some((l) => l.sku === "food.delivery")).toBe(true);
    // food.menu_display is included — not a cart line when not selected as paid
    expect(quote.lines.some((l) => l.sku === "food.menu_display")).toBe(false);
    // Pro monthly 1599 + pickup 199 + delivery 299
    expect(quote.monthlyTotal).toBe(1599 + 199 + 299);
    expect(quote.cycleTotal).toBe(quote.monthlyTotal);
    expect(quote.foodOpsBundleApplied).toBe(false);
  });

  it("applies Creator Partner % to plan and presence add-ons only", () => {
    const quote = buildSelectModulesQuote({
      tier: "basic",
      cycle: "monthly",
      // media_kit is included in Presence website — paid creator-eligible: analytics + watermark
      selectedSkus: ["pr.analytics_lite", "web.remove_watermark"],
      catalog: MODULE_CATALOG as unknown as Parameters<typeof buildSelectModulesQuote>[0]["catalog"],
      creator: { partnerTier: "A", industryGroup: "presence" },
    });

    // A = 35% monthly
    const planLine = quote.lines.find((l) => l.kind === "website_plan");
    expect(planLine?.discountPct).toBe(35);
    expect(planLine?.monthly).toBe(applyPctOff(599, 35));

    const analytics = quote.lines.find((l) => l.sku === "pr.analytics_lite");
    expect(analytics?.discountPct).toBe(35);
    expect(analytics?.monthly).toBe(applyPctOff(149, 35));

    const watermark = quote.lines.find((l) => l.sku === "web.remove_watermark");
    expect(watermark?.discountPct).toBe(35);
  });

  it("does not discount commerce modules for non-presence (no partner)", () => {
    const quote = buildSelectModulesQuote({
      tier: "basic",
      cycle: "annual",
      selectedSkus: ["sb.pay_then_book"],
      catalog: MODULE_CATALOG as unknown as Parameters<typeof buildSelectModulesQuote>[0]["catalog"],
      creator: { partnerTier: "B", industryGroup: "salon_beauty" },
    });
    const line = quote.lines.find((l) => l.sku === "sb.pay_then_book");
    expect(line?.discountPct).toBe(0);
    expect(quote.lines[0]?.discountPct).toBe(0);
  });

  it("skips included-in-website SKUs even if passed in cart", () => {
    const quote = buildSelectModulesQuote({
      tier: "basic",
      cycle: "monthly",
      selectedSkus: ["food.menu_display", "food.pickup"],
      catalog: MODULE_CATALOG as unknown as Parameters<typeof buildSelectModulesQuote>[0]["catalog"],
      creator: { industryGroup: "food" },
    });
    expect(quote.lines.map((l) => l.sku)).toEqual(["plan.basic", "food.pickup"]);
  });
});
