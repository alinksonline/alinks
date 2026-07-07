import { PageShell } from "@/components/shared/page-shell";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { eq } from "drizzle-orm";
import { getPlatformDb } from "@/platform/db/client";
import { tenants } from "@/platform/db/schema";
import type { SubscriptionTier } from "@/core/config/tiers";
import { canUseCustomDomain } from "@/core/utils/tier-gates";
import { DomainWizard } from "./domain-wizard";

export default async function DomainPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const db = getPlatformDb();
  const tenant = db ? (await db.select().from(tenants).where(eq(tenants.id, session.userId)).limit(1))[0] : null;
  const allowed = tenant ? canUseCustomDomain(tenant.tier as SubscriptionTier) : false;

  return (
    <PageShell maxWidth="md" className="py-10">
      <h1 className="text-2xl font-bold">Custom domain</h1>
      <p className="mt-2 text-sm text-slate-600">Pro+ only — TXT verification then CNAME to ALINKS.</p>
      {!allowed ? (
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Upgrade to Pro to connect a custom domain like shop.yourbrand.com
        </p>
      ) : (
        <DomainWizard
          businessId={business.id}
          currentDomain={business.customDomain ?? ""}
          verified={business.customDomainVerified ?? false}
          verifyToken={business.domainVerifyToken ?? ""}
        />
      )}
    </PageShell>
  );
}