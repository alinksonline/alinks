"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { AppLocale } from "@/core/i18n/messages";
import { SUPPORTED_LOCALES } from "@/core/i18n/messages";
import { getSession } from "@/platform/auth/session";
import { getPlatformDb } from "@/platform/db/client";
import { tenants } from "@/platform/db/schema";

const REGIONS = ["IN", "SG", "AE"] as const;

export async function updateLocaleAction(locale: AppLocale) {
  const session = await getSession();
  if (!session) return { success: false as const, error: "Unauthorized" };
  if (!SUPPORTED_LOCALES.includes(locale)) return { success: false as const, error: "Unsupported locale" };

  const db = getPlatformDb();
  if (!db) return { success: false as const, error: "Database not connected" };

  await db.update(tenants).set({ locale, updatedAt: new Date() }).where(eq(tenants.id, session.userId));
  revalidatePath("/dashboard/settings");
  return { success: true as const };
}

export async function updateRegionAction(region: string) {
  const session = await getSession();
  if (!session) return { success: false as const, error: "Unauthorized" };
  if (!REGIONS.includes(region as (typeof REGIONS)[number])) {
    return { success: false as const, error: "Unsupported region" };
  }

  const db = getPlatformDb();
  if (!db) return { success: false as const, error: "Database not connected" };

  await db.update(tenants).set({ region, updatedAt: new Date() }).where(eq(tenants.id, session.userId));
  revalidatePath("/dashboard/settings");
  return { success: true as const };
}

export async function updateAdsOptInAction(optIn: boolean) {
  const session = await getSession();
  if (!session) return { success: false as const, error: "Unauthorized" };

  const db = getPlatformDb();
  if (!db) return { success: false as const, error: "Database not connected" };

  await db.update(tenants).set({ adsOptIn: optIn, updatedAt: new Date() }).where(eq(tenants.id, session.userId));
  revalidatePath("/dashboard/settings");
  return { success: true as const };
}