import { describe, expect, it } from "vitest";
import {
  canEnableFoodModule,
  isDineInAllowedForFoodType,
  resolveFoodType,
} from "./food-compat";

describe("food compatibility", () => {
  it("blocks dine-in for cloud types", () => {
    expect(isDineInAllowedForFoodType("cloud_kitchen")).toBe(false);
    expect(isDineInAllowedForFoodType("cloud_catering")).toBe(false);
    expect(isDineInAllowedForFoodType("catering_only")).toBe(false);
    expect(isDineInAllowedForFoodType("restaurant")).toBe(true);
  });

  it("refuses food.dine_in module on cloud kitchen", () => {
    expect(canEnableFoodModule("cloud_kitchen", "food.dine_in")).toBe(false);
    expect(canEnableFoodModule("restaurant", "food.dine_in")).toBe(true);
    expect(canEnableFoodModule("cloud_kitchen", "food.menu_display")).toBe(true);
  });

  it("resolves legacy catering slug", () => {
    expect(resolveFoodType("catering")).toBe("catering_only");
    expect(resolveFoodType("cloud_kitchen")).toBe("cloud_kitchen");
  });
});
