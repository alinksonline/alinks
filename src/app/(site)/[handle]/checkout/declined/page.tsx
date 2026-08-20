import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/tenant/site-header";
import { TenantFooter } from "@/components/tenant/tenant-footer";
import { TenantThemedLayout } from "@/components/tenant/tenant-themed-layout";
import { PublicSiteNav } from "@/components/tenant/public-site-nav";
import { parseBusinessProfile } from "@/core/types/business-profile";
import { shouldShowAlinksWatermark } from "@/core/utils/branding";
import { buildTenantMetadata } from "@/core/utils/tenant-seo";
import { getPublicBusinessByHandle } from "@/tenant/site/get-public-business";
import { OrderDeclined } from "@/components/tenant/order-declined";

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  const business = await getPublicBusinessByHandle(params.handle);
  if (!business) return { title: "Payment declined" };
  return buildTenantMetadata({
    handle: params.handle,
    name: business.name,
    branding: business.branding,
    title: `${business.name} — Payment not completed`,
    description: `Payment was not completed with ${business.name}`,
    path: `/${params.handle}/checkout/declined`,
  });
}

export default async function CheckoutDeclinedPage({
  params,
  searchParams,
}: {
  params: { handle: string };
  searchParams: { reason?: string; orderId?: string; msg?: string };
}) {
  const row = await getPublicBusinessByHandle(params.handle);
  if (!row) notFound();

  const profile = parseBusinessProfile(row.branding, row.name);
  const business = { ...row, profile };
  const cancelled = searchParams.reason === "cancelled";

  return (
    <TenantThemedLayout theme={business.theme}>
      <SiteHeader business={business} profile={profile} />
      <OrderDeclined
        handle={params.handle}
        cancelled={cancelled}
        orderId={searchParams.orderId}
        message={searchParams.msg}
      />
      <TenantFooter
        business={business}
        profile={profile}
        showAlinksBranding={shouldShowAlinksWatermark(business.tier, business.entitledSkus)}
      />
      <PublicSiteNav handle={params.handle} vertical={business.vertical} slug="home" path="checkout" />
    </TenantThemedLayout>
  );
}
