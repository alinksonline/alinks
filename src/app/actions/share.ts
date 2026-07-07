"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { getEnv } from "@/core/config/env";
import { getSession } from "@/platform/auth/session";
import { assertBusinessOwnership } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { shareLinks } from "@/platform/db/schema";

function shortCode(): string {
  return crypto.randomBytes(4).toString("hex");
}

export async function createShareLinkAction(businessId: string, targetUrl: string, label?: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };

    const business = await assertBusinessOwnership(businessId, session.userId);
    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const code = shortCode();
    await db.insert(shareLinks).values({
      businessId,
      code,
      targetUrl,
      label: label?.trim() || null,
    });

    const env = getEnv();
    const shortUrl = `${env.NEXT_PUBLIC_APP_URL}/s/${code}`;

    revalidatePath("/dashboard/share");
    return { success: true as const, code, shortUrl, handle: business.handle };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Create failed" };
  }
}

export async function getShareLinksForBusiness(businessId: string) {
  const db = getPlatformDb();
  if (!db) return [];
  return db.select().from(shareLinks).where(eq(shareLinks.businessId, businessId));
}