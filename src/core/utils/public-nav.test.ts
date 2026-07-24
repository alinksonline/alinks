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

  it("adds Book for salon, beauty, and clinic", () => {
    expect(buildPublicNav("demo", "salon").some((i) => i.key === "book")).toBe(true);
    expect(buildPublicNav("demo", "beauty").some((i) => i.key === "book")).toBe(true);
    expect(buildPublicNav("demo", "clinic").some((i) => i.key === "book")).toBe(true);
    expect(buildPublicNav("demo", "kirana").some((i) => i.key === "book")).toBe(false);
  });

  it("keeps Legal out of the tab bar", () => {
    expect(buildPublicNav("demo", "salon").some((i) => i.label === "Legal")).toBe(false);
  });

  it("Presence has Links and no Shop", () => {
    const labels = buildPublicNav("creator", "presence").map((i) => i.label);
    expect(labels).toContain("Links");
    expect(labels).toContain("Contact");
    expect(labels).not.toContain("Shop");
    expect(labels).not.toContain("Book");
  });

  it("Food uses Menu path not Shop cart", () => {
    const items = buildPublicNav("tiffin", "restaurant", "food");
    expect(items.some((i) => i.label === "Menu")).toBe(true);
    expect(items.find((i) => i.label === "Menu")?.href).toBe("/tiffin/menu");
    expect(items.some((i) => i.label === "Shop")).toBe(false);
  });

  it("Retail uses Shop storefront", () => {
    const items = buildPublicNav("myshop", "ecommerce", "retail");
    expect(items.some((i) => i.label === "Shop")).toBe(true);
    expect(items.find((i) => i.label === "Shop")?.href).toBe("/myshop/store");
  });

  it("Bookings industry has Book tab", () => {
    const items = buildPublicNav("doc", "clinic", "bookings");
    expect(items.some((i) => i.key === "book")).toBe(true);
    expect(items.find((i) => i.key === "book")?.href).toBe("/doc/book");
  });

  it("Real estate has Listings path", () => {
    const items = buildPublicNav("homes", "general", "real_estate");
    expect(items.some((i) => i.label === "Listings")).toBe(true);
    expect(items.find((i) => i.label === "Listings")?.href).toBe("/homes/listings");
  });

  it("Education has Courses path", () => {
    const items = buildPublicNav("tutor", "general", "education");
    expect(items.some((i) => i.label === "Courses")).toBe(true);
    expect(items.find((i) => i.label === "Courses")?.href).toBe("/tutor/courses");
  });

  it("Fitness has Book tab", () => {
    const items = buildPublicNav("iron", "general", "fitness");
    expect(items.some((i) => i.key === "book")).toBe(true);
    expect(items.find((i) => i.key === "book")?.href).toBe("/iron/book");
    expect(items.some((i) => i.label === "Classes")).toBe(true);
  });

  it("Automotive dealer shows Vehicles not car checkout", () => {
    const items = buildPublicNav("cars", "general", "automotive", "used_car_dealer");
    expect(items.some((i) => i.label === "Vehicles")).toBe(true);
    expect(items.find((i) => i.label === "Vehicles")?.href).toBe("/cars/vehicles");
    expect(items.some((i) => i.key === "book")).toBe(false);
  });

  it("Automotive workshop shows Book", () => {
    const items = buildPublicNav("fix", "general", "automotive", "service_workshop");
    expect(items.some((i) => i.key === "book")).toBe(true);
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
