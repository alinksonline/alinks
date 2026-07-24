"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import {
  defaultPresenceExtras,
  type PresenceExtras,
} from "@/core/types/presence-extras";
import { getSession } from "@/platform/auth/session";
import { assertBusinessOwnership } from "@/platform/business/require-business";
import { hasModule } from "@/platform/billing/entitlements";
import { getPlatformDb } from "@/platform/db/client";
import { businesses } from "@/platform/db/schema";

export async function getPresenceExtrasAction(businessId: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(businessId, session.userId);
    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const row = (
      await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1)
    )[0];
    if (!row) return { success: false as const, error: "Not found" };

    const branding = (row.branding as Record<string, unknown>) ?? {};
    const extras = defaultPresenceExtras(branding.presenceExtras);

    return {
      success: true as const,
      extras,
      partnerTier: row.creatorPartnerTier,
      partnerAcceptedAt: row.creatorPartnerAcceptedAt?.toISOString() ?? null,
      industryGroup: row.industryGroup,
    };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function savePresenceExtrasAction(
  businessId: string,
  extrasInput: PresenceExtras,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    await assertBusinessOwnership(businessId, session.userId);
    const db = getPlatformDb();
    if (!db) return { success: false, error: "Database not connected" };

    const row = (
      await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1)
    )[0];
    if (!row) return { success: false, error: "Not found" };

    // Soft entitlement: media kit / proof / highlights prefer modules; always allow partner promo
    const cleaned = defaultPresenceExtras(extrasInput);
    const branding = {
      ...((row.branding as Record<string, unknown>) ?? {}),
      presenceExtras: cleaned,
    };

    await db
      .update(businesses)
      .set({ branding, updatedAt: new Date() })
      .where(eq(businesses.id, businessId));

    revalidatePath("/editor/presence");
    revalidatePath("/dashboard/creator-partner");
    revalidatePath(`/${row.handle}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function markCreatorPromoPostedAction(
  businessId: string,
  postUrl: string,
  notes?: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    await assertBusinessOwnership(businessId, session.userId);
    const db = getPlatformDb();
    if (!db) return { success: false, error: "Database not connected" };

    const row = (
      await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1)
    )[0];
    if (!row) return { success: false, error: "Not found" };
    if (!row.creatorPartnerTier) {
      return { success: false, error: "Not a Creator Partner business" };
    }

    const branding = (row.branding as Record<string, unknown>) ?? {};
    const extras = defaultPresenceExtras(branding.presenceExtras);
    extras.partnerPromo = {
      lastPostUrl: postUrl.trim(),
      lastPostedAt: new Date().toISOString(),
      notes: (notes ?? "").trim(),
      compliance: postUrl.trim() ? "good" : "pending",
    };

    await db
      .update(businesses)
      .set({
        branding: { ...branding, presenceExtras: extras },
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, businessId));

    revalidatePath("/dashboard/creator-partner");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function presenceModuleFlagsAction(businessId: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(businessId, session.userId);
    return {
      success: true as const,
      mediaKit: await hasModule(businessId, "pr.media_kit"),
      socialProof: await hasModule(businessId, "pr.social_proof"),
      highlights: await hasModule(businessId, "pr.highlights"),
    };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}
