"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { TIER_LIMITS } from "@/core/constants/limits";
import type { SubscriptionTier } from "@/core/config/tiers";
import { isValidHandle, normalizeHandle } from "@/core/utils/slug";
import { getSession } from "@/platform/auth/session";
import { getPlatformDb } from "@/platform/db/client";
import { businesses, tenants } from "@/platform/db/schema";

export async function getBusinessesForTenant(tenantId: string) {
  const db = getPlatformDb();
  if (!db) return [];
  return db.select().from(businesses).where(eq(businesses.tenantId, tenantId));
}

export async function switchActiveBusinessAction(businessId: string) {
  const session = await getSession();
  if (!session) return { success: false as const, error: "Unauthorized" };

  const db = getPlatformDb();
  if (!db) return { success: false as const, error: "Database not connected" };

  const biz = (await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1))[0];
  if (!biz || biz.tenantId !== session.userId) return { success: false as const, error: "Unauthorized" };

  await db.update(tenants).set({ activeBusinessId: businessId, updatedAt: new Date() }).where(eq(tenants.id, session.userId));
  revalidatePath("/dashboard");
  return { success: true as const, handle: biz.handle };
}

export async function createAdditionalBusinessAction(input: { name: string; handle: string; vertical: string }) {
  const session = await getSession();
  if (!session) return { success: false as const, error: "Unauthorized" };

  const db = getPlatformDb();
  if (!db) return { success: false as const, error: "Database not connected" };

  const tenant = (await db.select().from(tenants).where(eq(tenants.id, session.userId)).limit(1))[0];
  if (!tenant) return { success: false as const, error: "Tenant not found" };

  const tier = tenant.tier as SubscriptionTier;
  const existing = await getBusinessesForTenant(session.userId);
  if (existing.length >= TIER_LIMITS[tier].businesses) {
    return { success: false as const, error: `Your plan allows ${TIER_LIMITS[tier].businesses} business(es)` };
  }

  const handle = normalizeHandle(input.handle);
  if (!isValidHandle(handle)) return { success: false as const, error: "Invalid handle" };

  const taken = (await db.select().from(businesses).where(eq(businesses.handle, handle)).limit(1))[0];
  if (taken) return { success: false as const, error: "Handle taken" };

  const {
    defaultIndustryType,
    industryToLegacyVertical,
    resolveIndustryGroup,
  } = await import("@/core/config/industries");
  const industryGroup = resolveIndustryGroup(input.vertical);
  const industryType = defaultIndustryType(input.vertical);
  const vertical = industryToLegacyVertical(industryGroup, industryType);

  const [biz] = await db
    .insert(businesses)
    .values({
      tenantId: session.userId,
      handle,
      name: input.name.trim(),
      vertical,
      industryGroup,
      industryType,
      templateId: industryGroup === "presence" ? "presence" : "general",
    })
    .returning();

  const { grantDefaultModules } = await import("@/platform/billing/entitlements");
  await grantDefaultModules(biz.id, industryGroup, "onboarding");

  await db.update(tenants).set({ activeBusinessId: biz.id, updatedAt: new Date() }).where(eq(tenants.id, session.userId));
  revalidatePath("/dashboard");
  return { success: true as const, handle: biz.handle };
}