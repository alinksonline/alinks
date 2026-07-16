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
import { canExposeBooking, CLINIC_GATE_MESSAGE } from "@/core/utils/industry-gates";
import { isClinicLicenseGated } from "@/core/config/industries";
import { getBookPageDataAction } from "@/app/actions/salon";
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

export default async function BookPage({
  params,
  searchParams,
}: {
  params: { handle: string };
  searchParams?: { booked?: string; mode?: string; paid?: string };
}) {
  const row = await getPublicBusinessByHandle(params.handle);
  if (!row) notFound();

  const clinicGated = isClinicLicenseGated(row.industryType, row.vertical);
  const gateStatus = (row as { verticalGateStatus?: string }).verticalGateStatus;
  // Site may be published only after gate; still block book if status drifts
  if (clinicGated && gateStatus && gateStatus !== "approved") {
    const profile = parseBusinessProfile(row.branding, row.name);
    const business = { ...row, profile };
    return (
      <TenantThemedLayout theme={business.theme}>
        <SiteHeader business={business} profile={profile} />
        <main className="mx-auto max-w-app px-3.5 py-10 text-center">
          <h1 className="t-ink text-xl font-bold">Booking not live yet</h1>
          <p className="t-muted mt-2 text-sm">{CLINIC_GATE_MESSAGE}</p>
          <Link href={`/${params.handle}`} className="t-link mt-6 inline-block text-sm font-semibold">
            ← Home
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

  if (
    !canExposeBooking({
      vertical: row.vertical,
      industryGroup: row.industryGroup,
      industryType: row.industryType,
      verticalGateStatus: gateStatus,
    })
  ) {
    notFound();
  }

  const data = await getBookPageDataAction(params.handle);
  if (!data || data.packages.length === 0) notFound();

  const profile = parseBusinessProfile(row.branding, row.name);
  const business = { ...row, profile };
  const fromPrice = Math.min(...data.packages.map((p) => p.price));
  const freeCount = data.packages.filter((p) => (p.paymentMode || "free") !== "pay_then_book").length;
  const prepaidCount = data.packages.filter((p) => p.paymentMode === "pay_then_book").length;
  const isVenue = row.industryType === "venue_banquet";
  const isClinic = clinicGated;
  const isFitness = row.industryGroup === "fitness";
  const isAuto = row.industryGroup === "automotive";

  const bookedId = searchParams?.booked;
  const bookedMode = searchParams?.mode;
  const paid = searchParams?.paid === "1";

  const heroEyebrow = isAuto
    ? "Workshop"
    : isFitness
      ? "Fitness"
      : isVenue
        ? "Venue"
        : isClinic
          ? "Clinic"
          : "Appointments";
  const heroTitle = bookedId
    ? "You're booked"
    : isAuto
      ? "Book a service"
      : isFitness
        ? "Book a class or trial"
        : isVenue
          ? "Book a package"
          : "Book a slot";
  const heroSub = bookedId
    ? paid
      ? "Payment received. See you soon!"
      : bookedMode === "pay_at_salon"
        ? "Confirmed — pay when you arrive."
        : "Your free booking is confirmed."
    : isAuto
      ? "Free inspection and service slots without online pay. Pay at workshop when you drop the car."
      : isFitness
        ? "Free trials and classes need no online pay. Membership fees can be paid at the gym or later online."
        : isClinic
          ? "Pick a service and slot. No diagnosis is stored on ALINKS — patient details go to the clinic’s sheet."
          : "Free and pay-at-venue/consult packages need no online pay unless marked pay-then-book.";

  return (
    <TenantThemedLayout theme={business.theme}>
      <SiteHeader business={business} profile={profile} />

      <section className="t-page-hero">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: "var(--t-primary-text, var(--t-primary))" }}
        >
          {heroEyebrow}
        </p>
        <h1 className="t-ink mt-1.5 text-2xl font-bold tracking-tight">{heroTitle}</h1>
        <p className="t-muted mt-1.5 max-w-sm text-sm leading-relaxed">{heroSub}</p>
        {!bookedId ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="t-chip t-chip-active">From ₹{fromPrice}</span>
            <span className="t-chip">{data.packages.length} services</span>
            {freeCount > 0 ? <span className="t-chip">Free book OK</span> : null}
            {prepaidCount > 0 ? <span className="t-chip">Pay then book</span> : null}
          </div>
        ) : null}
      </section>

      <main className="mx-auto w-full max-w-app px-3.5 py-5 pb-4">
        {bookedId ? (
          <div className="t-card space-y-3 p-5 text-center">
            <p className="text-sm font-bold">Booking ID</p>
            <p className="font-mono text-xs break-all text-[var(--t-muted,#64748b)]">{bookedId}</p>
            <Link href={`/${params.handle}/book`} className="t-btn-primary mt-2">
              Book another
            </Link>
          </div>
        ) : (
          <BookingForm
            handle={params.handle}
            packages={data.packages}
            staff={data.staff}
            onlinePayEnabled={Boolean(business.onlinePayEnabled)}
          />
        )}
        {!bookedId ? (
          <div className="mt-6 text-center">
            <Link href={`/${params.handle}`} className="t-link text-xs font-semibold no-underline">
              Back to home
            </Link>
          </div>
        ) : null}
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
        slug="home"
        path="book"
      />
    </TenantThemedLayout>
  );
}
