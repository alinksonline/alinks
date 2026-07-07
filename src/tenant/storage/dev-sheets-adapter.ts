import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { SheetTab, StorageAdapter } from "./types";

const DATA_ROOT = path.join(process.cwd(), ".data", "tenant-sheets");

function sheetPath(businessId: string, tab: SheetTab): string {
  const safeTab = tab.replace(/\s+/g, "_").toLowerCase();
  return path.join(DATA_ROOT, businessId, `${safeTab}.json`);
}

async function ensureDir(filePath: string) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

export class DevSheetsAdapter implements StorageAdapter {
  constructor(private businessId: string) {}

  async readRows(tab: SheetTab): Promise<Record<string, string | number | boolean>[]> {
    const file = sheetPath(this.businessId, tab);
    try {
      const raw = await readFile(file, "utf8");
      const parsed = JSON.parse(raw) as Record<string, string | number | boolean>[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async appendRow(tab: SheetTab, row: Record<string, string | number | boolean>): Promise<void> {
    const file = sheetPath(this.businessId, tab);
    await ensureDir(file);
    const rows = await this.readRows(tab);
    rows.push({ ...row, _appendedAt: new Date().toISOString() });
    await writeFile(file, JSON.stringify(rows, null, 2), "utf8");
  }
}
