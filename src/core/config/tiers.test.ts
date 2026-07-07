import { describe, expect, it } from "vitest";
import {
  getAnnualBilledTotal,
  getAnnualSavings,
  getPerMonthPrice,
  TIER_PRICING,
} from "./tiers";

describe("tier pricing", () => {
  it("uses locked monthly list prices (Q033)", () => {
    expect(TIER_PRICING.basic.monthlyList).toBe(599);
    expect(TIER_PRICING.pro.monthlyList).toBe(1599);
    expect(TIER_PRICING.enterprise.monthlyList).toBe(6999);
  });

  it("uses locked annual per-month prices (Q034)", () => {
    expect(TIER_PRICING.basic.annualPerMonth).toBe(499);
    expect(TIER_PRICING.pro.annualPerMonth).toBe(1499);
    expect(TIER_PRICING.enterprise.annualPerMonth).toBe(4999);
  });

  it("computes annual billed totals", () => {
    expect(getAnnualBilledTotal("basic")).toBe(5988);
    expect(getAnnualBilledTotal("pro")).toBe(17988);
    expect(getAnnualBilledTotal("enterprise")).toBe(59988);
  });

  it("returns monthly list when cycle is monthly", () => {
    expect(getPerMonthPrice("basic", "monthly")).toBe(599);
    expect(getPerMonthPrice("pro", "annual")).toBe(1499);
  });

  it("computes annual savings vs paying monthly for a year", () => {
    expect(getAnnualSavings("basic")).toEqual({ amount: 1200, percent: 17 });
    expect(getAnnualSavings("enterprise").percent).toBe(29);
  });
});