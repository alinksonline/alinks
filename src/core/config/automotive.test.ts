import { describe, expect, it } from "vitest";
import {
  automotiveSeedProfile,
  isAutoDealerType,
  isAutoPartsType,
  isAutoWorkshopType,
} from "./automotive";
import {
  canExposeBooking,
  canExposeStorefront,
  canShowPackagesEditor,
  canShowVehicleListings,
} from "../utils/industry-gates";

describe("automotive", () => {
  it("classifies types", () => {
    expect(isAutoDealerType("used_car_dealer")).toBe(true);
    expect(isAutoWorkshopType("service_workshop")).toBe(true);
    expect(isAutoPartsType("spare_parts_shop")).toBe(true);
  });

  it("seeds by type", () => {
    expect(automotiveSeedProfile("used_car_dealer")).toEqual({
      vehicles: true,
      services: false,
      parts: false,
    });
    expect(automotiveSeedProfile("service_workshop").services).toBe(true);
    expect(automotiveSeedProfile("spare_parts_shop").parts).toBe(true);
  });

  it("gates storefront and book", () => {
    expect(
      canShowVehicleListings({
        vertical: "general",
        industryGroup: "automotive",
        industryType: "used_car_dealer",
      }),
    ).toBe(true);
    expect(
      canExposeBooking({
        vertical: "general",
        industryGroup: "automotive",
        industryType: "used_car_dealer",
      }),
    ).toBe(false);
    expect(
      canExposeBooking({
        vertical: "general",
        industryGroup: "automotive",
        industryType: "service_workshop",
      }),
    ).toBe(true);
    expect(
      canShowPackagesEditor({
        vertical: "general",
        industryGroup: "automotive",
        industryType: "service_workshop",
      }),
    ).toBe(true);
    expect(
      canExposeStorefront({
        vertical: "general",
        industryGroup: "automotive",
        industryType: "spare_parts_shop",
      }),
    ).toBe(true);
    expect(
      canExposeStorefront({
        vertical: "general",
        industryGroup: "automotive",
        industryType: "used_car_dealer",
      }),
    ).toBe(false);
  });
});
