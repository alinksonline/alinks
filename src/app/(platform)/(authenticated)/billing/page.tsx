import Link from "next/link";
import { eq } from "drizzle-orm";
import { PlanPricingCards } from "@/components/shared/plan-pricing-cards";
import { PageShell } from "@/components/shared/page-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { SubscriptionTier } from "@/core/config/tiers";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { tenants } from "@/platform/db/schema";
import { PromoForm } from "./promo-form";

export default async function BillingPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const db = getPlatformDb();
  const tenant = db
    ? (await db.select().from(tenants).where(eq(tenants.id, session.userId)).limit(1))[0]
    : null;

  const currentTier = (tenant?.tier ?? "basic") as SubscriptionTier;

  return (
    <PageShell maxWidth="lg" className="py-10">
      <h1 className="text-2xl font-bold">Billing</h1>
      <p className="mt-2 text-sm text-slate-600">
        Status: <strong>{tenant?.status ?? "unknown"}</strong>
        {tenant?.trialEndsAt && <> · Trial ends {tenant.trialEndsAt.toLocaleDateString()}</>}
      </p>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="font-semibold">Subscription for {business.name}</h2>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          Choose monthly (full list price) or yearly (lower per-month rate, billed upfront). Public publish
          requires a paid plan after trial — day 15 unpaid unpublishes your site.
        </CardContent>
      </Card>

      <div className="mt-8">
        <PlanPricingCards variant="billing" currentTier={currentTier} defaultCycle="annual" />
      </div>

      <PromoForm />
      <p className="mt-4 text-sm">
        <Link href="/editor/publish" className="font-semibold text-slate-900 underline">
          Go to publish checklist
        </Link>
      </p>
    </PageShell>
  );
}