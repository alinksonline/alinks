import type { SheetTab } from "./types";

/** Standard tabs for every ALINKS tenant workbook (end-customer data — not platform DB). */
export const STANDARD_SHEET_TABS: SheetTab[] = [
  "Orders",
  "Appointments",
  "Customers",
  "Patients",
  "Products",
  "Activity Log",
];

export const SHEET_HEADERS: Record<SheetTab, string[]> = {
  Orders: [
    "order_id",
    "created_at",
    "customer_name",
    "customer_phone",
    "items_json",
    "total_paise",
    "currency",
    "payment_method",
    "status",
    "notes",
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
    "notes",
  ],
  Customers: ["customer_id", "name", "phone", "email", "created_at", "notes"],
  Patients: ["patient_id", "name", "phone", "created_at", "notes"],
  Products: ["product_id", "name", "price_paise", "category", "stock", "sku", "updated_at"],
  "Activity Log": ["at", "action", "tab", "business_id", "detail"],
};

export function a1SheetRange(tab: SheetTab, range = "A:Z"): string {
  // Sheet titles with spaces need single quotes in A1 notation
  const title = tab.includes(" ") ? `'${tab}'` : tab;
  return `${title}!${range}`;
}
