import { eq } from "drizzle-orm";
import { LEGAL_DOC_TYPES } from "@/core/constants/legal";
import { hasLegalAcceptance } from "@/platform/legal/acceptances";
import { getPlatformDb } from "@/platform/db/client";
import { tenants } from "@/platform/db/schema";
import { getBusinessForTenant } from "@/platform/business/require-business";

export interface PublishGateResult {
  ok: boolean;
  blockers: string[];
  /** Machine keys for UI logic */
  blockerKeys: string[];
}

const FRIENDLY: Record<string, string> = {
  PLATFORM_TOS: "Accept platform Terms at signup",
  PLATFORM_PRIVACY: "Accept platform Privacy at signup",
  PLATFORM_AUP: "Accept Acceptable Use Policy at signup",
  TENANT_TOS_PUBLISHED: "Confirm your site Terms are ready (checkbox below)",
  TENANT_PRIVACY_PUBLISHED: "Confirm your site Privacy is ready (checkbox below)",
  SUBSCRIPTION: "Need active trial or paid plan",
  CLINIC: "Clinic license must be approved before going live",
  PHARMACY: "Pharmacy vertical needs superadmin approval",
  DB: "Database not connected",
  TENANT: "Account not found",
};

export async function checkSubscriptionGate(tenantId: string): Promise<{ ok: boolean; reason?: string; key?: string }> {
  const db = getPlatformDb();
  if (!db) return { ok: false, reason: FRIENDLY.DB, key: "DB" };

  const row = (await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1))[0];
  if (!row) return { ok: false, reason: FRIENDLY.TENANT, key: "TENANT" };

  if (row.status === "active") return { ok: true };
  if (row.status === "trial" && row.trialEndsAt && row.trialEndsAt > new Date()) return { ok: true };

  return { ok: false, reason: FRIENDLY.SUBSCRIPTION, key: "SUBSCRIPTION" };
}

export type PublishGateOptions = {
  /**
   * When true (default for final publish check), TENANT_TOS/PRIVACY must already be logged.
   * UI uses false — those acceptances are created by the confirm checkbox on submit.
   */
  requireTenantLegalLogged?: boolean;
};

/**
 * Publish readiness.
 * UI should call with requireTenantLegalLogged: false so the confirm checkbox can enable publish.
 * Action records TENANT_* then calls with default true.
 */
export async function evaluatePublishGate(
  tenantId: string,
  options: PublishGateOptions = {},
): Promise<PublishGateResult> {
  const requireTenantLegal = options.requireTenantLegalLogged !== false;
  const blockers: string[] = [];
  const blockerKeys: string[] = [];

  const requiredDocs = [
    LEGAL_DOC_TYPES.PLATFORM_TOS,
    LEGAL_DOC_TYPES.PLATFORM_PRIVACY,
    ...(requireTenantLegal
      ? ([LEGAL_DOC_TYPES.TENANT_TOS_PUBLISHED, LEGAL_DOC_TYPES.TENANT_PRIVACY_PUBLISHED] as const)
      : []),
  ] as const;

  for (const docType of requiredDocs) {
    const accepted = await hasLegalAcceptance(tenantId, docType);
    if (!accepted) {
      blockerKeys.push(docType);
      blockers.push(FRIENDLY[docType] ?? `Missing: ${docType}`);
    }
  }

  const sub = await checkSubscriptionGate(tenantId);
  if (!sub.ok) {
    blockerKeys.push(sub.key ?? "SUBSCRIPTION");
    blockers.push(sub.reason ?? FRIENDLY.SUBSCRIPTION);
  }

  const business = await getBusinessForTenant(tenantId);
  if (business) {
    if (business.vertical === "clinic" && business.verticalGateStatus !== "approved") {
      blockerKeys.push("CLINIC");
      blockers.push(FRIENDLY.CLINIC);
    }
    if (business.vertical === "pharmacy" && !business.pharmacyOtcApproved) {
      blockerKeys.push("PHARMACY");
      blockers.push(FRIENDLY.PHARMACY);
    }
  }

  return { ok: blockers.length === 0, blockers, blockerKeys };
}
