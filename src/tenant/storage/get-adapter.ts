import { eq } from "drizzle-orm";
import { getEnv } from "@/core/config/env";
import { getPlatformDb } from "@/platform/db/client";
import { businesses, supabaseConnectors } from "@/platform/db/schema";
import { DevSheetsAdapter } from "./dev-sheets-adapter";
import { SupabaseAdapter } from "./supabase-adapter";
import type { StorageAdapter } from "./types";

export async function getStorageAdapter(businessId: string): Promise<StorageAdapter> {
  const db = getPlatformDb();
  const biz = db ? (await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1))[0] : null;

  if (biz?.storageBackend === "supabase" && db) {
    const conn = (await db.select().from(supabaseConnectors).where(eq(supabaseConnectors.businessId, businessId)).limit(1))[0];
    if (conn?.isActive) return new SupabaseAdapter(businessId, conn.projectUrl);
  }

  const env = getEnv();
  const devMode = env.STORAGE_DEV_MODE === "true" || !env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (devMode) return new DevSheetsAdapter(businessId);
  return new DevSheetsAdapter(businessId);
}