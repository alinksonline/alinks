import { eq } from "drizzle-orm";
import { getEnv } from "@/core/config/env";
import { getPlatformDb } from "@/platform/db/client";
import { businesses, supabaseConnectors } from "@/platform/db/schema";
import { DevSheetsAdapter } from "./dev-sheets-adapter";
import { isGoogleSheetsConfigured } from "./google-auth";
import { GoogleSheetsAdapter } from "./google-sheets-adapter";
import { SupabaseAdapter } from "./supabase-adapter";
import type { StorageAdapter } from "./types";

export type StorageBackendKind = "google_sheets" | "dev_files" | "supabase";

export async function resolveStorageBackend(businessId: string): Promise<{
  kind: StorageBackendKind;
  spreadsheetId?: string | null;
  ready: boolean;
  reason?: string;
}> {
  const db = getPlatformDb();
  const biz = db ? (await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1))[0] : null;

  if (biz?.storageBackend === "supabase" && db) {
    const conn = (
      await db.select().from(supabaseConnectors).where(eq(supabaseConnectors.businessId, businessId)).limit(1)
    )[0];
    if (conn?.isActive) {
      return { kind: "supabase", ready: true };
    }
    return { kind: "supabase", ready: false, reason: "Supabase connector not active" };
  }

  const env = getEnv();
  const forceDev = env.STORAGE_DEV_MODE === "true";
  const sheetId = biz?.googleSpreadsheetId?.trim() || null;

  if (!forceDev && isGoogleSheetsConfigured() && sheetId && !sheetId.startsWith("dev-")) {
    return { kind: "google_sheets", spreadsheetId: sheetId, ready: true };
  }

  if (forceDev || !isGoogleSheetsConfigured()) {
    return {
      kind: "dev_files",
      spreadsheetId: sheetId,
      ready: true,
      reason: forceDev
        ? "STORAGE_DEV_MODE=true (local JSON files)"
        : "GOOGLE_SERVICE_ACCOUNT_JSON not set — using local JSON files",
    };
  }

  return {
    kind: "dev_files",
    spreadsheetId: sheetId,
    ready: Boolean(sheetId),
    reason: sheetId
      ? "Using local files until a real spreadsheet id is connected"
      : "No Google Spreadsheet connected — using local JSON files",
  };
}

export async function getStorageAdapter(businessId: string): Promise<StorageAdapter> {
  const resolved = await resolveStorageBackend(businessId);

  if (resolved.kind === "supabase") {
    const db = getPlatformDb();
    const conn = db
      ? (
          await db
            .select()
            .from(supabaseConnectors)
            .where(eq(supabaseConnectors.businessId, businessId))
            .limit(1)
        )[0]
      : null;
    if (conn?.isActive) return new SupabaseAdapter(businessId, conn.projectUrl);
  }

  if (resolved.kind === "google_sheets" && resolved.spreadsheetId) {
    return new GoogleSheetsAdapter(resolved.spreadsheetId);
  }

  return new DevSheetsAdapter(businessId);
}
