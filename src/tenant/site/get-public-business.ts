import type { SubscriptionTier } from "@/core/config/tiers";
import type { Business, BusinessVertical } from "@/core/types/tenant";
import { getPlatformDb } from "@/platform/db/client";
import { businesses, tenants } from "@/platform/db/schema";
import { eq } from "drizzle-orm";

function toBusiness(row: typeof businesses.$inferSelect, tier: SubscriptionTier): Business {
  return {
    id: row.id,
    tenantId: row.tenantId,
    handle: row.handle,
    name: row.name,
    vertical: row.vertical as BusinessVertical,
    industryGroup: row.industryGroup,
    industryType: row.industryType,
    tradeMode: row.tradeMode,
    verticalGateStatus: row.verticalGateStatus,
    creatorPartnerTier: row.creatorPartnerTier,
    tier,
    isPublished: row.isPublished,
    checkoutMode: row.checkoutMode as "lite" | "pro",
    codEnabled: row.codEnabled,
    onlinePayEnabled: Boolean(row.razorpayKeyId && row.razorpayKeySecretEnc),
    googleSpreadsheetId: row.googleSpreadsheetId,
    customDomain: row.customDomain,
    customDomainVerified: row.customDomainVerified,
    theme: (row.theme as Business["theme"]) ?? null,
    branding: (row.branding as Business["branding"]) ?? null,
  };
}

export async function getPublicBusinessByHandle(handle: string): Promise<Business | null> {
  const db = getPlatformDb();
  if (!db || !handle) return null;

  const rows = await db
    .select({ business: businesses, tier: tenants.tier })
    .from(businesses)
    .innerJoin(tenants, eq(businesses.tenantId, tenants.id))
    .where(eq(businesses.handle, handle))
    .limit(1);

  const row = rows[0];
  if (!row || !row.business.isPublished) return null;

  return toBusiness(row.business, row.tier as SubscriptionTier);
}

export async function getPublicBusinessByDomain(host: string): Promise<Business | null> {
  const db = getPlatformDb();
  if (!db || !host) return null;

  const rows = await db
    .select({ business: businesses, tier: tenants.tier })
    .from(businesses)
    .innerJoin(tenants, eq(businesses.tenantId, tenants.id))
    .where(eq(businesses.customDomain, host))
    .limit(1);

  const row = rows[0];
  if (!row || !row.business.isPublished || !row.business.customDomainVerified) return null;

  return toBusiness(row.business, row.tier as SubscriptionTier);
}

export async function getBusinessRowByHandle(handle: string) {
  const db = getPlatformDb();
  if (!db) return null;
  const rows = await db
    .select({ business: businesses, tier: tenants.tier })
    .from(businesses)
    .innerJoin(tenants, eq(businesses.tenantId, tenants.id))
    .where(eq(businesses.handle, handle))
    .limit(1);
  return rows[0] ?? null;
}