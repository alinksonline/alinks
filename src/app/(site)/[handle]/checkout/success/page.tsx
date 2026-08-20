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
import { OrderThankYou } from "@/components/tenant/order-thank-you";

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  const business = await getPublicBusinessByHandle(params.handle);
  if (!business) return { title: "Order Placed" };
  return buildTenantMetadata({
    handle: params.handle,
    name: business.name,
    branding: business.branding,
    title: `${business.name} — Order Placed`,
    description: `Thank you for ordering from ${business.name}`,
    path: `/${params.handle}/checkout/success`,
  });
}

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: { handle: string };
  searchParams: { orderId?: string };
}) {
  const row = await getPublicBusinessByHandle(params.handle);
  if (!row) notFound();

  const profile = parseBusinessProfile(row.branding, row.name);
  const business = { ...row, profile };

  return (
    <TenantThemedLayout theme={business.theme}>
      <SiteHeader business={business} profile={profile} />
      <main className="mx-auto max-w-app min-h-[40vh] px-3.5 py-10" />
      <OrderThankYou handle={params.handle} orderId={searchParams.orderId} />

      <TenantFooter
        business={business}
        profile={profile}
        showAlinksBranding={shouldShowAlinksWatermark(business.tier, business.entitledSkus)}
      />
      <PublicSiteNav handle={params.handle} vertical={business.vertical} slug="home" path="orders" />
    </TenantThemedLayout>
  );
}
