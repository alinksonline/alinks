import { and, eq } from "drizzle-orm";
import { getPlatformDb } from "@/platform/db/client";
import { promoCodes, promoRedemptions, tenants } from "@/platform/db/schema";

export const LAUNCH_PROMOS = {
  FIRST100: { discountMonths: 2, maxRedemptions: 100, description: "First 100 — 2 months free" },
  FREEMONTH: { discountMonths: 1, maxRedemptions: 500, description: "1 month free" },
} as const;

export async function redeemPromoCode(tenantId: string, code: string) {
  const db = getPlatformDb();
  if (!db) return { ok: false as const, error: "Database not connected" };

  const normalized = code.trim().toUpperCase();
  const promo = (await db.select().from(promoCodes).where(eq(promoCodes.code, normalized)).limit(1))[0];
  if (!promo || !promo.isActive) return { ok: false as const, error: "Invalid promo code" };
  if (promo.redemptionCount >= promo.maxRedemptions) return { ok: false as const, error: "Promo fully redeemed" };

  const existing = await db
    .select()
    .from(promoRedemptions)
    .where(and(eq(promoRedemptions.promoCodeId, promo.id), eq(promoRedemptions.tenantId, tenantId)))
    .limit(1);
  if (existing[0]) return { ok: false as const, error: "Already redeemed" };

  const tenant = (await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1))[0];
  if (!tenant) return { ok: false as const, error: "Tenant not found" };

  const base = tenant.trialEndsAt && tenant.trialEndsAt > new Date() ? tenant.trialEndsAt : new Date();
  const trialEndsAt = new Date(base.getTime() + promo.discountMonths * 30 * 24 * 60 * 60 * 1000);

  await db.insert(promoRedemptions).values({ promoCodeId: promo.id, tenantId });
  await db
    .update(promoCodes)
    .set({ redemptionCount: promo.redemptionCount + 1 })
    .where(eq(promoCodes.id, promo.id));
  await db
    .update(tenants)
    .set({ status: "trial", trialEndsAt, updatedAt: new Date() })
    .where(eq(tenants.id, tenantId));

  return { ok: true as const, trialEndsAt, months: promo.discountMonths };
}
