import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AnalyticsBeacon } from "@/components/tenant/analytics-beacon";
import { ANALYTICS_LITE_SKU } from "@/core/config/analytics";
import type { SubscriptionTier } from "@/core/config/tiers";
import { hasModule } from "@/platform/billing/entitlements";
import { getBusinessRowByHandle } from "@/tenant/site/get-public-business";
import { assertSubdomainAccess } from "@/tenant/site/subdomain-gate";

export default async function TenantSiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { handle: string };
}) {
  const h = headers();
  const urlMode = h.get("x-alinks-url-mode");

  const row = await getBusinessRowByHandle(params.handle);
  let analyticsEnabled = false;

  if (row?.business?.isPublished) {
    analyticsEnabled = await hasModule(row.business.id, ANALYTICS_LITE_SKU);
  }

  if (urlMode === "subdomain") {
    if (row) {
      const gate = assertSubdomainAccess(row.tier as SubscriptionTier, urlMode);
      if (!gate.allowed) {
        redirect(`/${params.handle}`);
      }
    }
  }

  return (
    <>
      {children}
      <AnalyticsBeacon handle={params.handle} enabled={analyticsEnabled} />
    </>
  );
}
