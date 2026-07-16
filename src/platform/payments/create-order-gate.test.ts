import { describe, expect, it } from "vitest";
import { requireCreateOrderIdentity } from "./create-order-gate";
import { canAcceptOrders } from "@/core/utils/industry-gates";

describe("requireCreateOrderIdentity", () => {
  it("rejects when neither handle nor businessId is set", () => {
    const r = requireCreateOrderIdentity({});
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.code).toBe("IDENTITY_REQUIRED");
      expect(r.status).toBe(400);
    }
  });

  it("rejects blank strings", () => {
    const r = requireCreateOrderIdentity({ handle: "  ", businessId: "" });
    expect(r.ok).toBe(false);
  });

  it("accepts handle only", () => {
    const r = requireCreateOrderIdentity({ handle: "my-shop" });
    expect(r).toEqual({ ok: true, handle: "my-shop", businessId: undefined });
  });

  it("accepts businessId only", () => {
    const r = requireCreateOrderIdentity({
      businessId: "11111111-1111-1111-1111-111111111111",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.businessId).toMatch(/^11111111/);
  });

  it("trims handle", () => {
    const r = requireCreateOrderIdentity({ handle: "  cafe  " });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.handle).toBe("cafe");
  });
});

describe("create-order industry pairing", () => {
  it("blocks presence even when identity would pass", () => {
    expect(
      canAcceptOrders({
        vertical: "presence",
        industryGroup: "presence",
        entitledSkus: [],
      }),
    ).toBe(false);
  });

  it("allows retail commerce", () => {
    expect(
      canAcceptOrders({
        vertical: "ecommerce",
        industryGroup: "retail",
      }),
    ).toBe(true);
  });
});
