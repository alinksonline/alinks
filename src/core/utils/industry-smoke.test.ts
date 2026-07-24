/**
 * Industry public-path smoke matrix (gates only — no live HTTP).
 * Complements create-order-gate + module-gates tests for E2E readiness.
 */
import { describe, expect, it } from "vitest";
import {
  canAcceptOrders,
  canExposeBooking,
  canExposeStorefront,
  canShowEducationCourses,
  canShowFoodMenu,
  canShowPropertyBank,
  canShowRetailStore,
  canShowVehicleListings,
  isPresence,
} from "./industry-gates";

describe("industry public smoke matrix", () => {
  it("presence: no storefront, no booking, no orders", () => {
    const input = {
      vertical: "presence",
      industryGroup: "presence",
      industryType: "influencer_creator",
    };
    expect(isPresence(input)).toBe(true);
    expect(canExposeStorefront(input)).toBe(false);
    expect(canExposeBooking(input)).toBe(false);
    expect(canAcceptOrders(input)).toBe(false);
  });

  it("salon: booking yes, retail store no", () => {
    const input = {
      vertical: "salon",
      industryGroup: "salon_beauty",
      industryType: "salon",
    };
    expect(canExposeBooking(input)).toBe(true);
    expect(canExposeStorefront(input)).toBe(false);
    expect(canShowRetailStore(input)).toBe(false);
  });

  it("retail: storefront yes, booking no", () => {
    const input = {
      vertical: "ecommerce",
      industryGroup: "retail",
      industryType: "ecommerce",
    };
    expect(canExposeStorefront(input)).toBe(true);
    expect(canAcceptOrders(input)).toBe(true);
    expect(canExposeBooking(input)).toBe(false);
    expect(canShowRetailStore(input)).toBe(true);
  });

  it("food: menu yes, retail cart no (Layer 1 = /menu)", () => {
    const input = {
      vertical: "restaurant",
      industryGroup: "food",
      industryType: "restaurant",
    };
    expect(canShowFoodMenu(input)).toBe(true);
    expect(canExposeStorefront(input)).toBe(false);
    expect(canAcceptOrders(input)).toBe(false);
  });

  it("clinic: book blocked until license approved", () => {
    const pending = {
      vertical: "clinic",
      industryGroup: "bookings",
      industryType: "clinic",
      verticalGateStatus: "pending",
    };
    const approved = { ...pending, verticalGateStatus: "approved" };
    expect(canExposeBooking(pending)).toBe(false);
    expect(canExposeBooking(approved)).toBe(true);
    expect(canExposeStorefront(approved)).toBe(false);
  });

  it("real estate: listings path, no cart", () => {
    const input = {
      vertical: "real_estate",
      industryGroup: "real_estate",
      industryType: "agent",
    };
    expect(canShowPropertyBank(input)).toBe(true);
    expect(canExposeStorefront(input)).toBe(false);
  });

  it("education: courses yes, storefront no", () => {
    const input = {
      vertical: "education",
      industryGroup: "education",
      industryType: "tuition",
    };
    expect(canShowEducationCourses(input)).toBe(true);
    expect(canExposeStorefront(input)).toBe(false);
  });

  it("automotive dealer: vehicles, not parts store without SKU", () => {
    const dealer = {
      vertical: "automotive",
      industryGroup: "automotive",
      industryType: "used_car_dealer",
    };
    expect(canShowVehicleListings(dealer)).toBe(true);
    expect(canExposeStorefront(dealer)).toBe(false);
  });
});
