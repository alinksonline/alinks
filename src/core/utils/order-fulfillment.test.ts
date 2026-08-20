import { describe, expect, it } from "vitest";
import {
  cartRequiresAddress,
  fulfillmentLabel,
  itemRequiresAddress,
  resolveCartAgainstCatalog,
} from "./order-fulfillment";

describe("order fulfillment address rules", () => {
  it("requires address for physical items (default)", () => {
    expect(itemRequiresAddress({})).toBe(true);
    expect(itemRequiresAddress({ productType: "physical" })).toBe(true);
  });

  it("requires address for doorstep services", () => {
    expect(
      itemRequiresAddress({ productType: "service", deliveryMode: "doorstep" }),
    ).toBe(true);
  });

  it("does not require address for service at tenant location", () => {
    expect(
      itemRequiresAddress({ productType: "service", deliveryMode: "location" }),
    ).toBe(false);
    expect(itemRequiresAddress({ productType: "service" })).toBe(false);
  });

  it("cart needs address if any line does", () => {
    expect(
      cartRequiresAddress([
        { productType: "service", deliveryMode: "location" },
        { productType: "physical" },
      ]),
    ).toBe(true);
    expect(
      cartRequiresAddress([{ productType: "service", deliveryMode: "location" }]),
    ).toBe(false);
  });

  it("labels fulfillment for the buyer", () => {
    expect(fulfillmentLabel({ productType: "service", deliveryMode: "location" })).toMatch(
      /at the shop/i,
    );
  });

  it("resolves cart lines from catalog prices and types", () => {
    const catalog = [
      {
        id: "p1",
        name: "Shirt",
        price: 500,
        productType: "physical" as const,
        deliveryMode: "doorstep" as const,
      },
    ];
    const resolved = resolveCartAgainstCatalog(
      [{ productId: "p1", name: "hack", price: 1, qty: 2, productType: "service", deliveryMode: "location" }],
      catalog,
    );
    expect(resolved).toEqual([
      { productId: "p1", name: "Shirt", price: 500, qty: 2, productType: "physical", deliveryMode: "doorstep" },
    ]);
    expect(resolveCartAgainstCatalog([{ productId: "nope", name: "x", price: 1, qty: 1 }], catalog)).toBeNull();
  });
});
