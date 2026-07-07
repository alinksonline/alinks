import { describe, expect, it } from "vitest";
import { DevSheetsAdapter } from "./dev-sheets-adapter";

describe("DevSheetsAdapter", () => {
  it("appends and reads rows", async () => {
    const adapter = new DevSheetsAdapter("test-business-id");
    await adapter.appendRow("Orders", { orderId: "o1", total: 100 });
    const rows = await adapter.readRows("Orders");
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows.some((r) => r.orderId === "o1")).toBe(true);
  });
});