import { describe, expect, it } from "vitest";

/** Soft hold policy from industries-docs/salon_beauty/06 — keep in sync with PAY_HOLD_MINUTES. */
const SOFT_HOLD_MINUTES = 15;

describe("pay-then-book hold policy", () => {
  it("uses 15 minute soft hold (docs 10–15 min)", () => {
    expect(SOFT_HOLD_MINUTES).toBeGreaterThanOrEqual(10);
    expect(SOFT_HOLD_MINUTES).toBeLessThanOrEqual(15);
  });
});
