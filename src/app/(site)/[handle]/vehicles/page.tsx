import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { VehicleListingsPublic } from "@/components/tenant/vehicle-listings-public";
import { SiteHeader } from "@/components/tenant/site-header";
import { TenantFooter } from "@/components/tenant/tenant-footer";
import { TenantThemedLayout } from "@/components/tenant/tenant-themed-layout";
import { PublicSiteNav } from "@/components/tenant/public-site-nav";
import { shouldShowAlinksWatermark } from "@/core/utils/branding";
import { parseBusinessProfile } from "@/core/types/business-profile";
import { buildTenantMetadata } from "@/core/utils/tenant-seo";
import { resolveIndustryGroup } from "@/core/config/industries";
import { getPublicVehiclesForHandle } from "@/app/actions/automotive";
import { getPublicBusinessByHandle } from "@/tenant/site/get-public-business";

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  const business = await getPublicBusinessByHandle(params.handle);
  if (!business) return { title: "Vehicles" };
  return buildTenantMetadata({
    handle: params.handle,
    name: business.name,
    branding: business.branding,
    title: `${business.name} — Vehicles`,
    description: `Vehicle inventory from ${business.name}`,
    path: `/${params.handle}/vehicles`,
  });
}

export default async function VehiclesPage({ params }: { params: { handle: string } }) {
  const row = await getPublicBusinessByHandle(params.handle);
  if (!row) notFound();
  if (resolveIndustryGroup(row.industryGroup || row.vertical) !== "automotive") notFound();

  const vehicles = await getPublicVehiclesForHandle(params.handle);
  const profile = parseBusinessProfile(row.branding, row.name);
  const business = { ...row, profile };

  return (
    <TenantThemedLayout theme={business.theme}>
      <SiteHeader business={business} profile={profile} />

      <section className="t-page-hero">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: "var(--t-primary-text, var(--t-primary))" }}
        >
          Automotive
        </p>
        <h1 className="t-ink mt-1.5 text-2xl font-bold tracking-tight">Vehicles</h1>
        <p className="t-muted mt-1.5 max-w-sm text-sm leading-relaxed">
          Browse stock and send a lead. No online car purchase or Artix financing checkout.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="t-chip t-chip-active">{vehicles.length} vehicles</span>
          <span className="t-chip">Enquiry only</span>
        </div>
      </section>

      <main className="mx-auto max-w-app px-3.5 py-4 pb-4">
        <VehicleListingsPublic
          handle={params.handle}
          businessName={business.name}
          vehicles={vehicles}
          whatsapp={profile.whatsapp || profile.phone}
        />
        <div className="mt-6 text-center">
          <Link href={`/${params.handle}`} className="t-link text-xs font-semibold no-underline">
            ← Home
          </Link>
        </div>
      </main>

      <TenantFooter
        business={business}
        profile={profile}
        showAlinksBranding={shouldShowAlinksWatermark(business.tier)}
      />
      <PublicSiteNav
        handle={params.handle}
        vertical={business.vertical}
        industryGroup={business.industryGroup}
        industryType={business.industryType}
        slug="home"
        path="vehicles"
      />
    </TenantThemedLayout>
  );
}
