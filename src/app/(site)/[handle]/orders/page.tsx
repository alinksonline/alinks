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
import { OrderHistory } from "@/components/tenant/order-history";

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  const business = await getPublicBusinessByHandle(params.handle);
  if (!business) return { title: "My Orders" };
  return buildTenantMetadata({
    handle: params.handle,
    name: business.name,
    branding: business.branding,
    title: `${business.name} — My Orders`,
    description: `View your past orders from ${business.name}`,
    path: `/${params.handle}/orders`,
  });
}

export default async function OrdersPage({
  params,
}: {
  params: { handle: string };
}) {
  const row = await getPublicBusinessByHandle(params.handle);
  if (!row) notFound();

  const profile = parseBusinessProfile(row.branding, row.name);
  const business = { ...row, profile };

  return (
    <TenantThemedLayout theme={business.theme}>
      <SiteHeader business={business} profile={profile} />

      <section className="t-page-hero">
        <h1 className="t-ink text-2xl font-bold tracking-tight">My Orders</h1>
        <p className="t-muted mt-1.5 max-w-sm text-sm leading-relaxed">
          Orders placed on this device
        </p>
      </section>

      <main className="mx-auto max-w-app px-3.5 py-5 pb-4 min-h-[50vh]">
        <OrderHistory
          handle={params.handle}
          businessPhone={profile.phone || profile.whatsapp || ""}
          allowCancel={Boolean(row.customerCancelOrders ?? true)}
          allowModify={Boolean(row.customerModifyOrders)}
        />
      </main>

      <TenantFooter
        business={business}
        profile={profile}
        showAlinksBranding={shouldShowAlinksWatermark(business.tier, business.entitledSkus)}
      />
      <PublicSiteNav handle={params.handle} vertical={business.vertical} slug="home" path="orders" />
    </TenantThemedLayout>
  );
}
