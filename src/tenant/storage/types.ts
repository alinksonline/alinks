/**
 * Tenant workbook tabs — end-customer data only (never platform Postgres PII).
 * Industry templates pick a subset; Activity Log is always present.
 */
export type SheetTab =
  | "Orders"
  | "Appointments"
  | "Customers"
  | "Patients"
  | "Products"
  | "Leads"
  | "Activity Log";

export interface StorageAdapter {
  appendRow(tab: SheetTab, row: Record<string, string | number | boolean>): Promise<void>;
  readRows(tab: SheetTab): Promise<Record<string, string | number | boolean>[]>;
  /** Optional: create tabs + header row for industry template. */
  ensureTabsAndHeaders?(tabs?: readonly SheetTab[]): Promise<void>;
}

export const CACHE_TTL_SECONDS = 15 * 60;
