import { describe, expect, it } from "vitest";
import { buildPublicNav, isPublicNavActive } from "./public-nav";

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

  it("adds Book for salon and beauty only", () => {
    expect(buildPublicNav("demo", "salon").some((i) => i.key === "book")).toBe(true);
    expect(buildPublicNav("demo", "beauty").some((i) => i.key === "book")).toBe(true);
    expect(buildPublicNav("demo", "clinic").some((i) => i.key === "book")).toBe(false);
    expect(buildPublicNav("demo", "kirana").some((i) => i.key === "book")).toBe(false);
  });

  it("keeps Legal out of the tab bar", () => {
    expect(buildPublicNav("demo", "salon").some((i) => i.label === "Legal")).toBe(false);
  });
});

describe("isPublicNavActive", () => {
  const book = buildPublicNav("demo", "salon").find((i) => i.key === "book")!;
  const shop = buildPublicNav("demo", "kirana").find((i) => i.key === "shop")!;
  const home = buildPublicNav("demo", "salon").find((i) => i.key === "home")!;

  it("marks book and shop paths", () => {
    expect(isPublicNavActive(book, "home", "book")).toBe(true);
    expect(isPublicNavActive(shop, "home", "store")).toBe(true);
    expect(isPublicNavActive(home, "home")).toBe(true);
    expect(isPublicNavActive(home, "home", "book")).toBe(false);
  });
});
