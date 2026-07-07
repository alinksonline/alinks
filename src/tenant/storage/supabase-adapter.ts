import type { SheetTab, StorageAdapter } from "./types";

/** Dev/test Supabase adapter — writes to local JSON like DevSheetsAdapter */
export class SupabaseAdapter implements StorageAdapter {
  constructor(
    private businessId: string,
    private projectUrl: string
  ) {}

  async readRows(tab: SheetTab): Promise<Record<string, string | number | boolean>[]> {
    const { DevSheetsAdapter } = await import("./dev-sheets-adapter");
    const fallback = new DevSheetsAdapter(`supabase:${this.businessId}`);
    return fallback.readRows(tab);
  }

  async appendRow(tab: SheetTab, row: Record<string, string | number | boolean>): Promise<void> {
    const { DevSheetsAdapter } = await import("./dev-sheets-adapter");
    const fallback = new DevSheetsAdapter(`supabase:${this.businessId}`);
    await fallback.appendRow(tab, { ...row, _backend: "supabase", _projectUrl: this.projectUrl });
  }
}