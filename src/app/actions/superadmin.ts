"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { SubscriptionTier } from "@/core/config/tiers";
import { getSession } from "@/platform/auth/session";
import { getPlatformDb } from "@/platform/db/client";
import { adSlots, businesses, tenants } from "@/platform/db/schema";
import { approvePharmacyOtcAction } from "@/app/actions/clinic";

async function requireSuperadminSession() {
  const session = await getSession();
  if (!session || session.role !== "superadmin") throw new Error("Unauthorized");
  return session;
}

export async function updateTenantTierAction(tenantId: string, tier: SubscriptionTier) {
  try {
    await requireSuperadminSession();
    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    await db.update(tenants).set({ tier, updatedAt: new Date() }).where(eq(tenants.id, tenantId));
    revalidatePath("/superadmin");
    revalidatePath("/superadmin/tenants");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function updateTenantStatusAction(tenantId: string, status: string) {
  try {
    await requireSuperadminSession();
    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    await db.update(tenants).set({ status, updatedAt: new Date() }).where(eq(tenants.id, tenantId));
    revalidatePath("/superadmin");
    revalidatePath("/superadmin/tenants");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function toggleBusinessPublishAction(businessId: string, publish: boolean) {
  try {
    await requireSuperadminSession();
    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    await db
      .update(businesses)
      .set({ isPublished: publish, updatedAt: new Date() })
      .where(eq(businesses.id, businessId));

    revalidatePath("/superadmin");
    revalidatePath("/superadmin/businesses");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function reviewAdSlotAction(slotId: string, approve: boolean) {
  try {
    await requireSuperadminSession();
    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    await db
      .update(adSlots)
      .set({
        status: approve ? "approved" : "rejected",
        isActive: approve,
      })
      .where(eq(adSlots.id, slotId));

    revalidatePath("/superadmin");
    revalidatePath("/superadmin/compliance");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export { approvePharmacyOtcAction };