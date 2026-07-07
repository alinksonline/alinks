"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { getSession } from "@/platform/auth/session";
import { assertBusinessOwnership } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { businesses, tenants } from "@/platform/db/schema";
import type { SubscriptionTier } from "@/core/config/tiers";
import { canUseCustomDomain } from "@/core/utils/tier-gates";

export async function setCustomDomainAction(businessId: string, domain: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };

    await assertBusinessOwnership(businessId, session.userId);
    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const tenant = (await db.select().from(tenants).where(eq(tenants.id, session.userId)).limit(1))[0];
    if (!tenant || !canUseCustomDomain(tenant.tier as SubscriptionTier)) {
      return { success: false as const, error: "Custom domains require Pro or Enterprise" };
    }

    const normalized = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (!normalized || normalized.includes("/")) {
      return { success: false as const, error: "Enter a valid domain like shop.example.com" };
    }

    const token = `alinks-verify-${crypto.randomBytes(8).toString("hex")}`;

    await db
      .update(businesses)
      .set({
        customDomain: normalized,
        customDomainVerified: false,
        domainVerifyToken: token,
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, businessId));

    revalidatePath("/dashboard/domain");
    return {
      success: true as const,
      domain: normalized,
      txtRecord: { host: `_alinks-verify.${normalized}`, value: token },
      cnameRecord: { host: normalized, value: "sites.alinks.online" },
    };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Save failed" };
  }
}

export async function verifyCustomDomainAction(businessId: string, token: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };

    const business = await assertBusinessOwnership(businessId, session.userId);
    if (!business.customDomain) return { success: false as const, error: "No domain configured" };
    if (business.domainVerifyToken !== token.trim()) {
      return { success: false as const, error: "Verification token mismatch" };
    }

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    await db
      .update(businesses)
      .set({ customDomainVerified: true, updatedAt: new Date() })
      .where(eq(businesses.id, businessId));

    revalidatePath("/dashboard/domain");
    return { success: true as const, domain: business.customDomain };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Verify failed" };
  }
}