/**
 * C2 — Industry sheet templates.
 * Which tabs a business needs + human-readable purpose.
 * Client PII stays in tenant Sheets / Supabase only.
 */

import {
  isClinicLicenseGated,
  resolveIndustryGroup,
  type IndustryGroup,
} from "@/core/config/industries";
import type { SheetTab } from "./types";
import { SHEET_HEADERS, STANDARD_SHEET_TABS } from "./sheet-tabs";

export type SheetTemplateLine = {
  tab: SheetTab;
  purpose: string;
  /** Primary for this industry (shown first). */
  primary: boolean;
};

const ALWAYS: SheetTab[] = ["Activity Log"];

function uniqueTabs(tabs: SheetTab[]): SheetTab[] {
  const seen = new Set<SheetTab>();
  const out: SheetTab[] = [];
  for (const t of tabs) {
    if (!seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  }
  return out;
}

/**
 * Tabs to provision for an industry (subset of STANDARD_SHEET_TABS).
 * Always includes Activity Log for write transparency.
 */
export function sheetTabsForIndustry(
  industryGroupOrVertical: string,
  industryType?: string | null,
): SheetTab[] {
  const g = resolveIndustryGroup(industryGroupOrVertical);
  let core: SheetTab[];

  switch (g) {
    case "presence":
      core = ["Customers", "Leads"];
      break;
    case "food":
      core = ["Orders", "Customers"];
      break;
    case "retail":
      core = ["Orders", "Products", "Customers"];
      break;
    case "salon_beauty":
    case "fitness":
      core = ["Appointments", "Customers"];
      break;
    case "bookings":
      core = ["Appointments", "Customers"];
      if (isClinicLicenseGated(industryType ?? undefined, industryGroupOrVertical)) {
        core.push("Patients");
      }
      break;
    case "real_estate":
      core = ["Leads", "Customers"];
      break;
    case "education":
      core = ["Leads", "Customers", "Appointments"];
      break;
    case "automotive": {
      // Dealer → leads; workshop → appointments; parts → orders/products
      const t = (industryType ?? "").toLowerCase();
      if (t.includes("part") || t.includes("spare")) {
        core = ["Orders", "Products", "Customers", "Leads"];
      } else if (t.includes("workshop") || t.includes("service") || t.includes("detail")) {
        core = ["Appointments", "Customers", "Leads"];
      } else {
        core = ["Leads", "Customers"];
      }
      break;
    }
    case "pharmacy":
      core = ["Orders", "Products", "Customers"];
      break;
    default:
      core = ["Orders", "Appointments", "Customers", "Leads"];
  }

  return uniqueTabs([...core, ...ALWAYS]);
}

export function sheetTemplateForIndustry(
  industryGroupOrVertical: string,
  industryType?: string | null,
): SheetTemplateLine[] {
  const tabs = sheetTabsForIndustry(industryGroupOrVertical, industryType);
  const g = resolveIndustryGroup(industryGroupOrVertical);

  const purpose: Record<SheetTab, string> = {
    Orders: foodOrRetailOrdersPurpose(g),
    Appointments: "Bookings, holds, and confirmed slots (customer name/phone).",
    Customers: "Contact list and non-clinic enquiries summary.",
    Patients: "Clinic patient contacts only — no diagnosis or clinical notes on ALINKS.",
    Products: "Product / parts catalogue mirror for tenant ops (optional).",
    Leads: "Property, vehicle, course, or collab leads (source + message).",
    "Activity Log": "Transparent write log (no extra PII beyond tab names).",
  };

  return tabs.map((tab, i) => ({
    tab,
    purpose: purpose[tab],
    primary: i === 0 && tab !== "Activity Log",
  }));
}

function foodOrRetailOrdersPurpose(g: IndustryGroup): string {
  if (g === "food") {
    return "Food tickets: pickup / delivery / dine-in channel, table, items, total.";
  }
  return "Store / commerce orders (COD and online).";
}

/** Headers for a tab (industry does not change column set — stable for adapters). */
export function headersForTab(tab: SheetTab): string[] {
  return [...SHEET_HEADERS[tab]];
}

/** Validate every industry maps only to known tabs. */
export function assertIndustryTemplatesValid(): void {
  const groups: IndustryGroup[] = [
    "presence",
    "salon_beauty",
    "food",
    "retail",
    "bookings",
    "real_estate",
    "education",
    "fitness",
    "automotive",
    "general",
    "pharmacy",
  ];
  for (const g of groups) {
    for (const tab of sheetTabsForIndustry(g)) {
      if (!STANDARD_SHEET_TABS.includes(tab)) {
        throw new Error(`Unknown tab ${tab} for ${g}`);
      }
      if (!SHEET_HEADERS[tab]?.length) {
        throw new Error(`Missing headers for ${tab}`);
      }
    }
  }
}

/** Default tab for a lead/enquiry write by industry. */
export function leadTabForIndustry(industryGroupOrVertical: string): SheetTab {
  const g = resolveIndustryGroup(industryGroupOrVertical);
  if (g === "bookings" && isClinicLicenseGated(undefined, industryGroupOrVertical)) {
    return "Patients";
  }
  if (
    g === "real_estate" ||
    g === "education" ||
    g === "automotive" ||
    g === "presence"
  ) {
    return "Leads";
  }
  return "Customers";
}
