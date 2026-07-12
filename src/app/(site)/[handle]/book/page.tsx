import { notFound } from "next/navigation";
import Link from "next/link";
import { BookingForm } from "@/components/tenant/booking-form";
import { SiteHeader } from "@/components/tenant/site-header";
import { TenantFooter } from "@/components/tenant/tenant-footer";
import { TenantThemedLayout } from "@/components/tenant/tenant-themed-layout";
import { shouldShowAlinksWatermark } from "@/core/utils/branding";
import { parseBusinessProfile } from "@/core/types/business-profile";
import { isRazorpayConfigured } from "@/platform/payments/razorpay";
import { getSalonPackagesForHandle } from "@/app/actions/salon";
import { getPublicBusinessByHandle } from "@/tenant/site/get-public-business";

export default async function BookPage({ params }: { params: { handle: string } }) {
  const row = await getPublicBusinessByHandle(params.handle);
  if (!row) notFound();
  if (row.vertical !== "salon" && row.vertical !== "beauty") notFound();

  const packages = await getSalonPackagesForHandle(params.handle);
  if (packages.length === 0) notFound();

  const profile = parseBusinessProfile(row.branding, row.name);
  const business = { ...row, profile };

  return (
    <TenantThemedLayout theme={business.theme}>
      <SiteHeader business={business} profile={profile} />
      <main className="mx-auto max-w-app px-3.5 py-6">
        <h1 className="t-ink text-lg font-bold">Book a package</h1>
        <p className="t-muted mt-0.5 text-xs">Pay-then-book — slots saved to your sheet</p>
        <div className="mt-4">
          <BookingForm handle={params.handle} packages={packages} devMode={!isRazorpayConfigured()} />
        </div>
        <Link href={`/${params.handle}/store`} className="t-link mt-5 inline-block text-xs">
          View catalog
        </Link>
      </main>
      <TenantFooter
        business={business}
        profile={profile}
        showAlinksBranding={shouldShowAlinksWatermark(business.tier)}
      />
    </TenantThemedLayout>
  );
}
