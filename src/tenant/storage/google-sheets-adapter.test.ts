import { describe, expect, it } from "vitest";
import { a1SheetRange, SHEET_HEADERS, STANDARD_SHEET_TABS } from "./sheet-tabs";

describe("sheet tabs", () => {
  it("defines all standard customer-data tabs", () => {
    expect(STANDARD_SHEET_TABS).toContain("Orders");
    expect(STANDARD_SHEET_TABS).toContain("Appointments");
    expect(STANDARD_SHEET_TABS).toContain("Customers");
    expect(STANDARD_SHEET_TABS).toContain("Patients");
    expect(STANDARD_SHEET_TABS).toContain("Activity Log");
  });

  it("has headers for every tab", () => {
    for (const tab of STANDARD_SHEET_TABS) {
      expect(SHEET_HEADERS[tab].length).toBeGreaterThan(2);
    }
  });

  it("quotes sheet names with spaces in A1 ranges", () => {
    expect(a1SheetRange("Activity Log", "A1")).toBe("'Activity Log'!A1");
    expect(a1SheetRange("Orders", "A:Z")).toBe("Orders!A:Z");
  });
});
