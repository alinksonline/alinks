import { describe, expect, it } from "vitest";
import {
  assertIndustryTemplatesValid,
  leadTabForIndustry,
  sheetTabsForIndustry,
  sheetTemplateForIndustry,
} from "./industry-sheets";
import { SHEET_HEADERS, STANDARD_SHEET_TABS } from "./sheet-tabs";

describe("industry sheet templates (C2)", () => {
  it("validates all industry templates", () => {
    expect(() => assertIndustryTemplatesValid()).not.toThrow();
  });

  it("food uses Orders + Customers + Activity Log", () => {
    const tabs = sheetTabsForIndustry("food");
    expect(tabs).toContain("Orders");
    expect(tabs).toContain("Customers");
    expect(tabs).toContain("Activity Log");
    expect(tabs).not.toContain("Patients");
  });

  it("salon uses Appointments", () => {
    expect(sheetTabsForIndustry("salon_beauty")).toContain("Appointments");
  });

  it("clinic bookings include Patients", () => {
    const tabs = sheetTabsForIndustry("bookings", "clinic");
    expect(tabs).toContain("Patients");
    expect(tabs).toContain("Appointments");
  });

  it("RE and education use Leads", () => {
    expect(sheetTabsForIndustry("real_estate")).toContain("Leads");
    expect(sheetTabsForIndustry("education")).toContain("Leads");
    expect(leadTabForIndustry("real_estate")).toBe("Leads");
    expect(leadTabForIndustry("education")).toBe("Leads");
  });

  it("auto parts includes Orders + Products", () => {
    const tabs = sheetTabsForIndustry("automotive", "spare_parts_shop");
    expect(tabs).toContain("Orders");
    expect(tabs).toContain("Products");
  });

  it("presence is lean (no Orders)", () => {
    const tabs = sheetTabsForIndustry("presence");
    expect(tabs).not.toContain("Orders");
    expect(tabs).toContain("Activity Log");
  });

  it("Orders headers include food channel columns", () => {
    expect(SHEET_HEADERS.Orders).toContain("channel");
    expect(SHEET_HEADERS.Orders).toContain("table_label");
    expect(SHEET_HEADERS.Leads).toContain("lead_type");
  });

  it("template lines have purposes", () => {
    const lines = sheetTemplateForIndustry("food");
    expect(lines.length).toBeGreaterThan(1);
    expect(lines.every((l) => l.purpose.length > 10)).toBe(true);
  });

  it("standard catalog includes Leads", () => {
    expect(STANDARD_SHEET_TABS).toContain("Leads");
  });
});
