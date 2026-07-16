import { describe, expect, it } from "vitest";
import {
  canEnableFoodModule,
  channelAllowedForFoodType,
  isDineInAllowedForFoodType,
} from "./food-compat";

describe("food ops channels", () => {
  it("blocks dine-in for cloud types", () => {
    expect(isDineInAllowedForFoodType("cloud_kitchen")).toBe(false);
    expect(canEnableFoodModule("cloud_kitchen", "food.dine_in")).toBe(false);
    expect(channelAllowedForFoodType("cloud_kitchen", "dine_in")).toBe(false);
    expect(channelAllowedForFoodType("restaurant", "dine_in")).toBe(true);
  });

  it("allows pickup/delivery for cloud and restaurant", () => {
    expect(channelAllowedForFoodType("cloud_kitchen", "pickup")).toBe(true);
    expect(channelAllowedForFoodType("restaurant", "delivery")).toBe(true);
    expect(canEnableFoodModule("catering_only", "food.delivery")).toBe(false);
  });
});
