export type SheetTab = "Orders" | "Appointments" | "Customers" | "Patients" | "Activity Log" | "Products";

export interface StorageAdapter {
  appendRow(tab: SheetTab, row: Record<string, string | number | boolean>): Promise<void>;
  readRows(tab: SheetTab): Promise<Record<string, string | number | boolean>[]>;
}

export const CACHE_TTL_SECONDS = 15 * 60;