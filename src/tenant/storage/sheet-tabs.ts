import type { SheetTab } from "./types";

/** Full catalog of ALINKS tenant workbook tabs. */
export const STANDARD_SHEET_TABS: SheetTab[] = [
  "Orders",
  "Appointments",
  "Customers",
  "Patients",
  "Products",
  "Leads",
  "Activity Log",
];

/**
 * Header row for each tab (snake_case).
 * Food ops reuse Orders with channel / table columns.
 * RE / auto / education enquiries → Leads.
 */
export const SHEET_HEADERS: Record<SheetTab, string[]> = {
  Orders: [
    "order_id",
    "created_at",
    "channel",
    "table_label",
    "customer_name",
    "customer_phone",
    "customer_address",
    "items_json",
    "total_paise",
    "currency",
    "payment_method",
    "payment_status",
    "status",
    "notes",
    "delivery_status",
    "delivery_partner",
    "tracking_id",
    "tracking_url",
  ],
  Appointments: [
    "booking_id",
    "created_at",
    "customer_name",
    "customer_phone",
    "package_name",
    "staff_name",
    "starts_at",
    "duration_minutes",
    "status",
    "payment_status",
    "payment_mode",
    "notes",
  ],
  Customers: ["customer_id", "name", "phone", "email", "source", "created_at", "notes"],
  Patients: ["patient_id", "name", "phone", "created_at", "notes"],
  Products: ["product_id", "name", "price_paise", "category", "brand", "stock", "sku", "updated_at", "type", "delivery_mode"],
  Leads: [
    "lead_id",
    "created_at",
    "source",
    "lead_type",
    "name",
    "phone",
    "email",
    "message",
    "ref_id",
    "ref_title",
    "status",
    "notes",
  ],
  "Activity Log": ["at", "action", "tab", "business_id", "detail"],
};

export function a1SheetRange(tab: SheetTab, range = "A:Z"): string {
  const title = tab.includes(" ") ? `'${tab}'` : tab;
  return `${title}!${range}`;
}

export function isSheetTab(value: string): value is SheetTab {
  return (STANDARD_SHEET_TABS as readonly string[]).includes(value);
}
