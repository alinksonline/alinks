import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookingForm } from "@/components/tenant/booking-form";
import { SiteHeader } from "@/components/tenant/site-header";
import { TenantFooter } from "@/components/tenant/tenant-footer";
import { TenantThemedLayout } from "@/components/tenant/tenant-themed-layout";
import { PublicSiteNav } from "@/components/tenant/public-site-nav";
import { shouldShowAlinksWatermark } from "@/core/utils/branding";
import { parseBusinessProfile } from "@/core/types/business-profile";
import { buildTenantMetadata } from "@/core/utils/tenant-seo";
import { getSalonPackagesForHandle } from "@/app/actions/salon";
import { getPublicBusinessByHandle } from "@/tenant/site/get-public-business";

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  const business = await getPublicBusinessByHandle(params.handle);
  if (!business) return { title: "Book" };
  return buildTenantMetadata({
    handle: params.handle,
    name: business.name,
    branding: business.branding,
    title: `${business.name} — Book`,
    description: `Book an appointment with ${business.name}`,
    path: `/${params.handle}/book`,
  });
}

export default async function BookPage({ params }: { params: { handle: string } }) {
  const row = await getPublicBusinessByHandle(params.handle);
  if (!row) notFound();
  if (row.vertical !== "salon" && row.vertical !== "beauty") notFound();

  const packages = await getSalonPackagesForHandle(params.handle);
  if (packages.length === 0) notFound();

  const profile = parseBusinessProfile(row.branding, row.name);
  const business = { ...row, profile };
  const fromPrice = Math.min(...packages.map((p) => p.price));

  return (
    <TenantThemedLayout theme={business.theme}>
      <SiteHeader business={business} profile={profile} />

      <section className="t-page-hero">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: "var(--t-primary-text, var(--t-primary))" }}
        >
          Appointments
        </p>
        <h1 className="t-ink mt-1.5 text-2xl font-bold tracking-tight">Book a package</h1>
        <p className="t-muted mt-1.5 max-w-sm text-sm leading-relaxed">
          Pick a service, choose a slot, and pay to lock it in. Bookings land in the salon&apos;s Google Sheet.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="t-chip t-chip-active">From ₹{fromPrice}</span>
          <span className="t-chip">{packages.length} packages</span>
          <span className="t-chip">Pay-then-book</span>
        </div>
      </section>

      <main className="mx-auto w-full max-w-app px-3.5 py-5 pb-4">
        <BookingForm
          handle={params.handle}
          packages={packages}
          onlinePayEnabled={Boolean(business.onlinePayEnabled)}
        />

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs">
          <Link href={`/${params.handle}/store`} className="t-link font-semibold no-underline">
            Browse shop
          </Link>
          <span className="t-muted">·</span>
          <Link href={`/${params.handle}`} className="t-link font-semibold no-underline">
            Back to home
          </Link>
        </div>
      </main>

      <TenantFooter
        business={business}
        profile={profile}
        showAlinksBranding={shouldShowAlinksWatermark(business.tier)}
      />
      <PublicSiteNav handle={params.handle} vertical={business.vertical} slug="home" path="book" />
    </TenantThemedLayout>
  );
}
