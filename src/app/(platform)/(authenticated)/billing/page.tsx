import Link from "next/link";
import { eq } from "drizzle-orm";
import { getBillingModulesDataAction } from "@/app/actions/billing-modules";
import { PlanPricingCards } from "@/components/shared/plan-pricing-cards";
import { PageShell } from "@/components/shared/page-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { SubscriptionTier } from "@/core/config/tiers";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { tenants } from "@/platform/db/schema";
import { IndustrySwitchPanel } from "./industry-switch-panel";
import { PromoForm } from "./promo-form";
import { SelectModulesPanel } from "./select-modules-panel";

export default async function BillingPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const db = getPlatformDb();
  const tenant = db
    ? (await db.select().from(tenants).where(eq(tenants.id, session.userId)).limit(1))[0]
    : null;

  const currentTier = (tenant?.tier ?? "basic") as SubscriptionTier;
  const modulesResult = await getBillingModulesDataAction("annual");

  return (
    <PageShell maxWidth="lg" className="py-10">
      <p className="premium-label">Platform · ALINKS</p>
      <h1 className="mt-1 text-2xl font-bold text-brand-ink">Billing</h1>
      <p className="mt-2 text-sm text-brand-muted">
        What <strong>you</strong> pay Artix for ALINKS (plan + modules). Not how customers pay your
        shop — that is Website → <strong>Checkout</strong>.
      </p>
      <p className="mt-2 text-sm text-brand-muted">
        Status: <strong className="text-brand-ink">{tenant?.status ?? "unknown"}</strong>
        {tenant?.trialEndsAt && <> · Trial ends {tenant.trialEndsAt.toLocaleDateString()}</>}
        {" · "}
        Industry: <strong className="text-brand-ink">{business.industryGroup || business.vertical}</strong>
      </p>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="font-semibold">Website plan · {business.name}</h2>
        </CardHeader>
        <CardContent className="text-sm text-brand-muted">
          Choose monthly (list price) or yearly (lower per-month, billed upfront). After trial, unpaid
          accounts unpublish on day 15. Modules below stack on top of this plan.
        </CardContent>
      </Card>

      <div className="mt-8">
        <PlanPricingCards variant="billing" currentTier={currentTier} defaultCycle="annual" />
      </div>

      {modulesResult.success ? (
        <SelectModulesPanel data={modulesResult.data} selectedTier={currentTier} defaultCycle="annual" />
      ) : (
        <p className="mt-8 text-sm text-red-600">{modulesResult.error}</p>
      )}

      <IndustrySwitchPanel
        currentGroup={business.industryGroup || business.vertical}
        currentType={business.industryType}
      />

      <PromoForm />
      <p className="mt-4 text-sm">
        <Link href="/editor/publish" className="font-semibold text-slate-900 underline">
          Go to publish checklist
        </Link>
      </p>
    </PageShell>
  );
}
