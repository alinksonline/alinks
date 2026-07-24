"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import type { AppLocale } from "@/core/i18n/messages";
import { SUPPORTED_LOCALES } from "@/core/i18n/messages";
import { LEGAL_DOC_TYPES } from "@/core/constants/legal";
import { destroySession, getSession } from "@/platform/auth/session";
import { getPlatformDb } from "@/platform/db/client";
import { businesses, tenants } from "@/platform/db/schema";
import { recordLegalAcceptance } from "@/platform/legal/acceptances";

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

export async function exportTenantDataAction() {
  const session = await getSession();
  if (!session) return { success: false as const, error: "Unauthorized" };

  const db = getPlatformDb();
  if (!db) return { success: false as const, error: "Database not connected" };

  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, session.userId)).limit(1);
  if (!tenant) return { success: false as const, error: "Account not found" };

  const tenantBusinesses = await db
    .select({
      handle: businesses.handle,
      name: businesses.name,
      vertical: businesses.vertical,
      isPublished: businesses.isPublished,
      templateId: businesses.templateId,
      storageBackend: businesses.storageBackend,
      createdAt: businesses.createdAt,
    })
    .from(businesses)
    .where(eq(businesses.tenantId, session.userId));

  const payload = {
    exportedAt: new Date().toISOString(),
    account: {
      email: tenant.email,
      phone: tenant.phone,
      name: tenant.name,
      tier: tenant.tier,
      status: tenant.status,
      locale: tenant.locale,
      region: tenant.region,
      adsOptIn: tenant.adsOptIn,
      trialEndsAt: tenant.trialEndsAt,
      createdAt: tenant.createdAt,
    },
    businesses: tenantBusinesses,
    note:
      "This export covers your ALINKS platform account and site configuration only. Customer orders, bookings, and patients in your Google Sheet or Supabase are not included — export those from your own storage.",
  };

  return { success: true as const, json: JSON.stringify(payload, null, 2) };
}

/**
 * Withdraw optional platform processing (publisher ads).
 * Required platform processing (account, security, billing) continues until delete.
 * Logs CONSENT_WITHDRAWAL for evidence.
 */
export async function withdrawOptionalConsentAction() {
  const session = await getSession();
  if (!session) return { success: false as const, error: "Unauthorized" };

  const db = getPlatformDb();
  if (!db) return { success: false as const, error: "Database not connected" };

  await db
    .update(tenants)
    .set({ adsOptIn: false, updatedAt: new Date() })
    .where(eq(tenants.id, session.userId));

  const h = headers();
  try {
    await recordLegalAcceptance({
      tenantId: session.userId,
      docType: LEGAL_DOC_TYPES.CONSENT_WITHDRAWAL,
      ipAddress: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? undefined,
      userAgent: h.get("user-agent") ?? undefined,
      metadata: {
        scope: "optional_processing",
        cleared: ["adsOptIn"],
        note: "Essential account processing continues until account deletion",
      },
    });
  } catch {
    /* still succeed preference change if log fails */
  }

  revalidatePath("/dashboard/settings");
  return { success: true as const };
}

export async function deleteAccountAction(confirmText: string) {
  const session = await getSession();
  if (!session) return { success: false as const, error: "Unauthorized" };

  if (confirmText.trim() !== "DELETE") {
    return { success: false as const, error: 'Type DELETE (all caps) to confirm account deletion' };
  }

  if (session.role === "superadmin") {
    return {
      success: false as const,
      error: "Superadmin accounts cannot be self-deleted. Contact support@alinks.online.",
    };
  }

  const db = getPlatformDb();
  if (!db) return { success: false as const, error: "Database not connected" };

  const tenantId = session.userId;
  await destroySession();
  await db.delete(tenants).where(eq(tenants.id, tenantId));

  return { success: true as const };
}