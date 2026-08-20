import { describe, expect, it } from "vitest";
import { buildPublicNav, isPublicNavActive } from "./public-nav";

describe("buildPublicNav", () => {
  it("salon does not show a Products shop tab", () => {
    const labels = buildPublicNav("demo", "salon").map((i) => i.label);
    expect(labels).toContain("Services");
    expect(labels).not.toContain("Products");
    expect(labels).not.toContain("Shop");
  });

  it("uses Services for salon and Products + Services for ecommerce", () => {
    expect(buildPublicNav("x", "salon").some((i) => i.label === "Services")).toBe(true);
    const ecom = buildPublicNav("x", "ecommerce");
    expect(ecom.some((i) => i.label === "Products")).toBe(true);
    expect(ecom.some((i) => i.label === "Services")).toBe(true);
    expect(ecom.find((i) => i.label === "Products")?.href).toBe("/x/products");
    expect(ecom.find((i) => i.label === "Services")?.href).toBe("/x/service-shop");
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

  it("Retail uses standalone Products and Services catalogs", () => {
    const items = buildPublicNav("myshop", "ecommerce", "retail");
    expect(items.find((i) => i.label === "Products")?.href).toBe("/myshop/products");
    expect(items.find((i) => i.label === "Services")?.href).toBe("/myshop/service-shop");
  });

  it("hides Products or Services when catalogMode is one-sided", () => {
    const productsOnly = buildPublicNav("myshop", "ecommerce", "retail", null, "products");
    expect(productsOnly.some((i) => i.label === "Products")).toBe(true);
    expect(productsOnly.some((i) => i.label === "Services")).toBe(false);
    const servicesOnly = buildPublicNav("myshop", "ecommerce", "retail", null, "services");
    expect(servicesOnly.some((i) => i.label === "Products")).toBe(false);
    expect(servicesOnly.some((i) => i.label === "Services")).toBe(true);
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
