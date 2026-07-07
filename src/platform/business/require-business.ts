import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import type { Session } from "@/core/types/auth";
import { getPlatformDb } from "@/platform/db/client";
import { businesses, tenants } from "@/platform/db/schema";

export async function getBusinessForTenant(tenantId: string) {
  const db = getPlatformDb();
  if (!db) return null;

  const tenant = (await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1))[0];
  if (tenant?.activeBusinessId) {
    const active = (await db.select().from(businesses).where(eq(businesses.id, tenant.activeBusinessId)).limit(1))[0];
    if (active && active.tenantId === tenantId) return active;
  }

  const rows = await db.select().from(businesses).where(eq(businesses.tenantId, tenantId)).limit(1);
  return rows[0] ?? null;
}

export async function requireBusiness(session: Session) {
  const business = await getBusinessForTenant(session.userId);
  if (!business) redirect("/onboarding");
  return business;
}

export async function assertBusinessOwnership(businessId: string, tenantId: string) {
  const db = getPlatformDb();
  if (!db) throw new Error("Database not connected");
  const rows = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, businessId))
    .limit(1);
  const business = rows[0];
  if (!business || business.tenantId !== tenantId) {
    throw new Error("Unauthorized");
  }
  return business;
}