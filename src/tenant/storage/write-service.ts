import { and, eq, lte } from "drizzle-orm";
import { getPlatformDb } from "@/platform/db/client";
import { writeQueue } from "@/platform/db/schema";
import { cacheDel, cacheKey } from "./redis-cache";
import { getStorageAdapter } from "./get-adapter";
import type { SheetTab } from "./types";

const RETRY_DELAYS_MS = [60_000, 300_000, 900_000, 3_600_000, 14_400_000];

export async function writeToTenantStorage(
  businessId: string,
  tab: SheetTab,
  row: Record<string, string | number | boolean>
): Promise<{ ok: true } | { ok: false; queued: boolean }> {
  const adapter = await getStorageAdapter(businessId);
  try {
    await adapter.appendRow(tab, row);
    try {
      await adapter.appendRow("Activity Log", {
        action: "write",
        tab,
        business_id: businessId,
        at: new Date().toISOString(),
        detail: "ok",
      });
    } catch {
      // Activity log failure must not fail the primary write
    }
    await cacheDel(cacheKey(businessId, tab));
    return { ok: true };
  } catch (e) {
    await enqueueFailedWrite(businessId, tab, row, e instanceof Error ? e.message : "Write failed");
    return { ok: false, queued: true };
  }
}

async function enqueueFailedWrite(
  businessId: string,
  tab: SheetTab,
  row: Record<string, string | number | boolean>,
  error: string
) {
  const db = getPlatformDb();
  if (!db) return;

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await db.insert(writeQueue).values({
    businessId,
    sheetTab: tab,
    rowData: row,
    expiresAt,
    lastError: error,
  });
}

export async function processWriteQueue(limit = 20): Promise<number> {
  const db = getPlatformDb();
  if (!db) return 0;

  const now = new Date();
  const pending = await db
    .select()
    .from(writeQueue)
    .where(and(lte(writeQueue.nextRetryAt, now)))
    .limit(limit);

  let processed = 0;
  for (const item of pending) {
    if (item.expiresAt < now || item.attempts >= item.maxAttempts) {
      await db.delete(writeQueue).where(eq(writeQueue.id, item.id));
      continue;
    }

    const adapter = await getStorageAdapter(item.businessId);
    const tab = item.sheetTab as SheetTab;
    const row = item.rowData as Record<string, string | number | boolean>;

    try {
      await adapter.appendRow(tab, row);
      await cacheDel(cacheKey(item.businessId, tab));
      await db.delete(writeQueue).where(eq(writeQueue.id, item.id));
      processed++;
    } catch (e) {
      const attempts = item.attempts + 1;
      if (attempts >= item.maxAttempts) {
        await db.delete(writeQueue).where(eq(writeQueue.id, item.id));
        continue;
      }
      const delay = RETRY_DELAYS_MS[Math.min(attempts - 1, RETRY_DELAYS_MS.length - 1)];
      await db
        .update(writeQueue)
        .set({
          attempts,
          nextRetryAt: new Date(Date.now() + delay),
          lastError: e instanceof Error ? e.message : "Retry failed",
        })
        .where(eq(writeQueue.id, item.id));
    }
  }
  return processed;
}

export async function readCachedSheetRows(
  businessId: string,
  tab: SheetTab
): Promise<Record<string, string | number | boolean>[]> {
  const { cacheGet, cacheSet, cacheKey: keyFn } = await import("./redis-cache");
  const key = keyFn(businessId, tab);
  const cached = await cacheGet(key);
  if (cached) {
    try {
      return JSON.parse(cached) as Record<string, string | number | boolean>[];
    } catch {
      /* fall through */
    }
  }

  const adapter = await getStorageAdapter(businessId);
  const rows = await adapter.readRows(tab);
  await cacheSet(key, JSON.stringify(rows));
  return rows;
}