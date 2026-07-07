import { eq } from "drizzle-orm";
import { LEGAL_DOC_TYPES } from "@/core/constants/legal";
import { hasLegalAcceptance } from "@/platform/legal/acceptances";
import { getPlatformDb } from "@/platform/db/client";
import { businesses, tenants } from "@/platform/db/schema";
import { getBusinessForTenant } from "@/platform/business/require-business";

export interface PublishGateResult {
  ok: boolean;
  blockers: string[];
}

export async function checkSubscriptionGate(tenantId: string): Promise<{ ok: boolean; reason?: string }> {
  const db = getPlatformDb();
  if (!db) return { ok: false, reason: "Database not connected" };

  const row = (await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1))[0];
  if (!row) return { ok: false, reason: "Tenant not found" };

  if (row.status === "active") return { ok: true };
  if (row.status === "trial" && row.trialEndsAt && row.trialEndsAt > new Date()) return { ok: true };

  return { ok: false, reason: "Active subscription or valid trial required (Q035)" };
}

export async function evaluatePublishGate(tenantId: string): Promise<PublishGateResult> {
  const blockers: string[] = [];

  const requiredDocs = [
    LEGAL_DOC_TYPES.PLATFORM_TOS,
    LEGAL_DOC_TYPES.PLATFORM_PRIVACY,
    LEGAL_DOC_TYPES.TENANT_TOS_PUBLISHED,
    LEGAL_DOC_TYPES.TENANT_PRIVACY_PUBLISHED,
  ] as const;

  for (const docType of requiredDocs) {
    const accepted = await hasLegalAcceptance(tenantId, docType);
    if (!accepted) blockers.push(`Missing acceptance: ${docType}`);
  }

  const sub = await checkSubscriptionGate(tenantId);
  if (!sub.ok) blockers.push(sub.reason ?? "Subscription gate failed");

  const business = await getBusinessForTenant(tenantId);
  if (business) {
    if (business.vertical === "clinic" && business.verticalGateStatus !== "approved") {
      blockers.push("Clinic NMC license must be approved by superadmin (Q018)");
    }
    if (business.vertical === "pharmacy" && !business.pharmacyOtcApproved) {
      blockers.push("Pharmacy OTC vertical requires superadmin approval (Q016)");
    }
  }

  return { ok: blockers.length === 0, blockers };
}