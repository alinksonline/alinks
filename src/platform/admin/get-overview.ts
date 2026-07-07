import { eq, sql } from "drizzle-orm";
import { getPlatformDb } from "@/platform/db/client";
import {
  adSlots,
  aiUsage,
  businesses,
  checkoutSessions,
  clinicLicenses,
  promoRedemptions,
  shareLinks,
  staffMembers,
  supabaseConnectors,
  tenants,
  writeQueue,
} from "@/platform/db/schema";

export async function getSuperadminOverview() {
  const db = getPlatformDb();
  if (!db) {
    return null;
  }

  const [
    allTenants,
    allBusinesses,
    published,
    proCheckout,
    pendingLicenses,
    pendingAds,
    pendingPharmacy,
    writeQueueCount,
    shareLinkCount,
    staffCount,
    supabaseCount,
    paidSessions,
    promoRedemptionsCount,
    aiUsageRows,
  ] = await Promise.all([
    db.select().from(tenants),
    db.select().from(businesses),
    db.select().from(businesses).where(eq(businesses.isPublished, true)),
    db.select().from(businesses).where(eq(businesses.checkoutMode, "pro")),
    db.select().from(clinicLicenses).where(eq(clinicLicenses.status, "pending")),
    db.select().from(adSlots).where(eq(adSlots.status, "pending")),
    db
      .select()
      .from(businesses)
      .where(sql`${businesses.vertical} = 'pharmacy' AND ${businesses.pharmacyOtcApproved} = false`),
    db.select().from(writeQueue),
    db.select().from(shareLinks),
    db.select().from(staffMembers),
    db.select().from(supabaseConnectors).where(eq(supabaseConnectors.isActive, true)),
    db.select().from(checkoutSessions).where(eq(checkoutSessions.status, "paid")),
    db.select().from(promoRedemptions),
    db.select().from(aiUsage),
  ]);

  const tierCounts = { basic: 0, pro: 0, enterprise: 0 };
  const statusCounts = { trial: 0, active: 0, past_due: 0, suspended: 0 };
  for (const t of allTenants) {
    if (t.tier in tierCounts) tierCounts[t.tier as keyof typeof tierCounts]++;
    if (t.status in statusCounts) statusCounts[t.status as keyof typeof statusCounts]++;
  }

  const verticalCounts: Record<string, number> = {};
  for (const b of allBusinesses) {
    verticalCounts[b.vertical] = (verticalCounts[b.vertical] ?? 0) + 1;
  }

  const aiCallsThisMonth = aiUsageRows.reduce((sum, r) => sum + r.count, 0);

  return {
    tenants: allTenants.length,
    businesses: allBusinesses.length,
    published: published.length,
    proCheckout: proCheckout.length,
    tierCounts,
    statusCounts,
    verticalCounts,
    pendingLicenses: pendingLicenses.length,
    pendingAds: pendingAds.length,
    pendingPharmacy: pendingPharmacy.length,
    writeQueueCount: writeQueueCount.length,
    shareLinks: shareLinkCount.length,
    staffMembers: staffCount.length,
    supabaseConnectors: supabaseCount.length,
    paidCheckouts: paidSessions.length,
    promoRedemptions: promoRedemptionsCount.length,
    aiCallsThisMonth,
    tenantsList: allTenants,
    businessesList: allBusinesses,
    pendingLicenseList: pendingLicenses,
    pendingAdList: pendingAds,
    pendingPharmacyList: pendingPharmacy,
  };
}