import { describe, expect, it } from "vitest";
import { buildPublicNav } from "./public-nav";

describe("buildPublicNav", () => {
  it("never shows both Services and Shop", () => {
    for (const v of ["general", "ecommerce", "salon", "clinic", "kirana"]) {
      const labels = buildPublicNav("demo", v).map((i) => i.label);
      const hasServices = labels.includes("Services");
      const hasShop = labels.includes("Shop");
      expect(hasServices && hasShop).toBe(false);
    }
  });

  it("uses Services for salon and Shop for ecommerce", () => {
    expect(buildPublicNav("x", "salon").some((i) => i.label === "Services")).toBe(true);
    expect(buildPublicNav("x", "ecommerce").some((i) => i.label === "Shop")).toBe(true);
  });
});
