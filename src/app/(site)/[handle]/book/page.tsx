import { notFound } from "next/navigation";
import Link from "next/link";
import { BookingForm } from "@/components/tenant/booking-form";
import { SiteHeader } from "@/components/tenant/site-header";
import { TenantFooter } from "@/components/tenant/tenant-footer";
import { shouldShowAlinksWatermark } from "@/core/utils/branding";
import { isRazorpayConfigured } from "@/platform/payments/razorpay";
import { getSalonPackagesForHandle } from "@/app/actions/salon";
import { getPublicBusinessByHandle } from "@/tenant/site/get-public-business";

export default async function BookPage({ params }: { params: { handle: string } }) {
  const business = await getPublicBusinessByHandle(params.handle);
  if (!business) notFound();
  if (business.vertical !== "salon" && business.vertical !== "beauty") notFound();

  const packages = await getSalonPackagesForHandle(params.handle);
  if (packages.length === 0) notFound();

  return (
    <>
      <SiteHeader business={business} />
      <main className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-2xl font-bold">Book a package</h1>
        <p className="mt-1 text-sm text-slate-500">Pay-then-book — slots saved to your sheet</p>
        <div className="mt-6">
          <BookingForm handle={params.handle} packages={packages} devMode={!isRazorpayConfigured()} />
        </div>
        <Link href={`/${params.handle}/store`} className="mt-6 inline-block text-sm underline">
          View catalog
        </Link>
      </main>
      <TenantFooter business={business} showAlinksBranding={shouldShowAlinksWatermark(business.tier)} />
    </>
  );
}