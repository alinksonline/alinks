import { describe, expect, it } from "vitest";
import {
  cartRequiresAddress,
  fulfillmentLabel,
  itemRequiresAddress,
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
});
