import { describe, expect, it } from "vitest";
import { splitCatalog } from "./catalog-kind";

describe("splitCatalog", () => {
  it("puts unmarked items with physical products", () => {
    const { physical, services } = splitCatalog([
      { id: "1", name: "Oil", price: 10 },
      { id: "2", name: "Repair", price: 20, productType: "service" },
    ]);
    expect(physical.map((p) => p.id)).toEqual(["1"]);
    expect(services.map((p) => p.id)).toEqual(["2"]);
  });
});
