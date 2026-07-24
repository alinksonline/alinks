import { describe, expect, it } from "vitest";
import { isClinicLicenseGated } from "./industries";
import { canExposeBooking, canShowPropertyBank, canShowPackagesEditor } from "../utils/industry-gates";

describe("wave2 bookings + re gates", () => {
  it("clinic requires approved gate for public book", () => {
    expect(
      canExposeBooking({
        vertical: "clinic",
        industryGroup: "bookings",
        industryType: "clinic",
        verticalGateStatus: "pending_review",
      }),
    ).toBe(false);
    expect(
      canExposeBooking({
        vertical: "clinic",
        industryGroup: "bookings",
        industryType: "clinic",
        verticalGateStatus: "approved",
      }),
    ).toBe(true);
  });

  it("professional consult books without license gate", () => {
    expect(isClinicLicenseGated("professional_consult", "general")).toBe(false);
    expect(
      canExposeBooking({
        vertical: "general",
        industryGroup: "bookings",
        industryType: "professional_consult",
      }),
    ).toBe(true);
  });

  it("packages editor open for bookings", () => {
    expect(
      canShowPackagesEditor({ vertical: "general", industryGroup: "bookings" }),
    ).toBe(true);
  });

  it("property bank only for real_estate", () => {
    expect(canShowPropertyBank({ vertical: "general", industryGroup: "real_estate" })).toBe(true);
    expect(canShowPropertyBank({ vertical: "clinic", industryGroup: "bookings" })).toBe(false);
  });

  it("fitness packages and free book", () => {
    expect(
      canShowPackagesEditor({ vertical: "general", industryGroup: "fitness" }),
    ).toBe(true);
    expect(
      canExposeBooking({ vertical: "general", industryGroup: "fitness" }),
    ).toBe(true);
  });
});
