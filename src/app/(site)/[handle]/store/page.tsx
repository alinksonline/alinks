import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/tenant/site-header";
import { TenantFooter } from "@/components/tenant/tenant-footer";
import { TenantThemedLayout } from "@/components/tenant/tenant-themed-layout";
import { PublicSiteNav } from "@/components/tenant/public-site-nav";
import { shouldShowAlinksWatermark } from "@/core/utils/branding";
import { splitCatalog } from "@/core/utils/catalog-kind";
import {
  catalogModeShowsProducts,
  catalogModeShowsServices,
  normalizeCatalogMode,
} from "@/core/utils/catalog-mode";
import { parseBusinessProfile } from "@/core/types/business-profile";
import { getPublicBusinessByHandle } from "@/tenant/site/get-public-business";
import { getCatalogByHandle } from "@/tenant/storage/catalog";

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  const business = await getPublicBusinessByHandle(params.handle);
  if (!business) return { title: "Shop" };
  const { buildTenantMetadata } = await import("@/core/utils/tenant-seo");
  return buildTenantMetadata({
    handle: params.handle,
    name: business.name,
    branding: business.branding,
    title: `${business.name} — Shop`,
    description: `Products and services from ${business.name}`,
    path: `/${params.handle}/store`,
  });
}

export default async function StorePage({ params }: { params: { handle: string } }) {
  const row = await getPublicBusinessByHandle(params.handle);
  if (!row) notFound();

  const { resolveIndustryGroup } = await import("@/core/config/industries");
  const group = resolveIndustryGroup(row.industryGroup || row.vertical);
  if (group === "food" || row.vertical === "restaurant") {
    redirect(`/${params.handle}/menu`);
  }

  const { canExposeStorefront } = await import("@/core/utils/industry-gates");
  const { listEntitledSkus } = await import("@/platform/billing/entitlements");
  const entitledSkus = await listEntitledSkus(row.id);
  if (
    !canExposeStorefront({
      vertical: row.vertical,
      industryGroup: row.industryGroup,
      industryType: row.industryType,
      entitledSkus,
    })
  ) {
    notFound();
  }

  const catalogMode = normalizeCatalogMode(row.catalogMode);
  if (catalogMode === "products") redirect(`/${params.handle}/products`);
  if (catalogMode === "services") redirect(`/${params.handle}/service-shop`);

  const { physical, services } = splitCatalog(await getCatalogByHandle(params.handle));
  if (physical.length > 0 && services.length === 0 && catalogModeShowsProducts(catalogMode)) {
    redirect(`/${params.handle}/products`);
  }
  if (services.length > 0 && physical.length === 0 && catalogModeShowsServices(catalogMode)) {
    redirect(`/${params.handle}/service-shop`);
  }

  const profile = parseBusinessProfile(row.branding, row.name);
  const business = { ...row, profile };

  return (
    <TenantThemedLayout theme={business.theme}>
      <SiteHeader business={business} profile={profile} />
      <section className="t-page-hero">
        <h1 className="t-ink text-2xl font-bold tracking-tight">Shop</h1>
        <p className="t-muted mt-1.5 max-w-sm text-sm leading-relaxed">
          Products and services are separate. Pick what you need.
        </p>
      </section>
      <main className="mx-auto grid max-w-app gap-3 px-3.5 py-5 pb-4">
        <Link href={`/${params.handle}/products`} className="t-card p-4">
          <p className="t-ink text-sm font-bold">Products</p>
          <p className="t-muted mt-1 text-xs">Physical items · {physical.length} listed</p>
        </Link>
        <Link href={`/${params.handle}/service-shop`} className="t-card p-4">
          <p className="t-ink text-sm font-bold">Services</p>
          <p className="t-muted mt-1 text-xs">Work we do for you · {services.length} listed</p>
        </Link>
        <Link href={`/${params.handle}/account`} className="t-link text-center text-xs font-semibold">
          Client login / my orders →
        </Link>
      </main>
      <TenantFooter
        business={business}
        profile={profile}
        showAlinksBranding={shouldShowAlinksWatermark(business.tier, business.entitledSkus)}
      />
      <PublicSiteNav
        handle={params.handle}
        vertical={business.vertical}
        industryGroup={business.industryGroup}
        slug="home"
        path="store"
        catalogMode={catalogMode}
      />
    </TenantThemedLayout>
  );
}
