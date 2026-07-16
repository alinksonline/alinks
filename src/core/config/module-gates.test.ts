import { describe, expect, it } from "vitest";
import {
  findSeasonalCoupon,
  foodChannelModuleSku,
  FOOD_OPS_BUNDLE,
  missingModuleMessage,
} from "./module-gates";
import { canUsePayThenBook, canExposeStorefront } from "../utils/industry-gates";
import { MODULE_CATALOG } from "./modules";
import { buildSelectModulesQuote } from "./select-modules-quote";

describe("module gates", () => {
  it("maps food channels to paid SKUs", () => {
    expect(foodChannelModuleSku("pickup")).toBe("food.pickup");
    expect(foodChannelModuleSku("delivery")).toBe("food.delivery");
    expect(foodChannelModuleSku("dine_in")).toBe("food.dine_in");
    expect(foodChannelModuleSku("whatsapp")).toBeNull();
  });

  it("messages point to Select modules", () => {
    expect(missingModuleMessage("food.pickup")).toMatch(/Select modules/);
  });

  it("pay then book only for salon with entitlement", () => {
    expect(
      canUsePayThenBook({
        vertical: "salon",
        industryGroup: "salon_beauty",
        entitledSkus: ["sb.pay_then_book"],
      }),
    ).toBe(true);
    expect(
      canUsePayThenBook({
        vertical: "salon",
        industryGroup: "salon_beauty",
        entitledSkus: [],
      }),
    ).toBe(false);
    expect(
      canUsePayThenBook({
        vertical: "fitness",
        industryGroup: "fitness",
        entitledSkus: ["sb.pay_then_book"],
      }),
    ).toBe(false);
  });

  it("auto parts storefront requires module when entitlements loaded", () => {
    expect(
      canExposeStorefront({
        vertical: "automotive",
        industryGroup: "automotive",
        industryType: "spare_parts_shop",
        entitledSkus: ["auto.parts_retail"],
      }),
    ).toBe(true);
    expect(
      canExposeStorefront({
        vertical: "automotive",
        industryGroup: "automotive",
        industryType: "spare_parts_shop",
        entitledSkus: [],
      }),
    ).toBe(false);
  });

  it("finds seasonal coupons in window", () => {
    const food = findSeasonalCoupon("FOODFEST15", "food", "2026-07-01");
    expect(food?.moduleDiscountPct).toBe(15);
    expect(findSeasonalCoupon("FOODFEST15", "salon_beauty", "2026-07-01")).toBeNull();
    expect(findSeasonalCoupon("MONSOON10", "retail", "2026-07-01")?.code).toBe("MONSOON10");
    expect(findSeasonalCoupon("MONSOON10", "retail", "2026-12-01")).toBeNull();
  });

  it("applies food ops bundle when all three channel SKUs selected", () => {
    const quote = buildSelectModulesQuote({
      tier: "basic",
      cycle: "monthly",
      selectedSkus: ["food.pickup", "food.delivery", "food.dine_in"],
      catalog: MODULE_CATALOG as unknown as Parameters<typeof buildSelectModulesQuote>[0]["catalog"],
      creator: { industryGroup: "food" },
      applyFoodOpsBundle: true,
    });
    expect(quote.foodOpsBundleApplied).toBe(true);
    // Bundle reduces channel lines by 10%
    const pickup = quote.lines.find((l) => l.sku === "food.pickup");
    expect(pickup?.monthly).toBe(Math.round(199 * 0.9));
  });

  it("applies seasonal coupon to module lines", () => {
    const coupon = findSeasonalCoupon("FOODFEST15", "food", "2026-07-01");
    const quote = buildSelectModulesQuote({
      tier: "basic",
      cycle: "monthly",
      selectedSkus: ["food.pickup"],
      catalog: MODULE_CATALOG as unknown as Parameters<typeof buildSelectModulesQuote>[0]["catalog"],
      creator: { industryGroup: "food" },
      seasonalCoupon: coupon,
    });
    const line = quote.lines.find((l) => l.sku === "food.pickup");
    expect(line?.discountPct).toBe(15);
    expect(line?.monthly).toBe(Math.round(199 * 0.85));
    // Plan not discounted by seasonal coupon
    expect(quote.lines[0]?.discountPct).toBe(0);
  });

  it("food ops pack SKUs are complete", () => {
    expect(FOOD_OPS_BUNDLE.skus).toHaveLength(3);
  });
});
