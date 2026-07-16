import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { EditorNav } from "@/components/editor/editor-nav";
import { PageShell } from "@/components/shared/page-shell";
import { canShowPackagesEditor } from "@/core/utils/industry-gates";
import { requireAuth } from "@/platform/auth/session";
import { hasModule } from "@/platform/billing/entitlements";
import { requireBusiness } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { salonPackages } from "@/platform/db/schema";
import { getTenantGatewayStatus } from "@/platform/payments/tenant-gateway";
import { PackagesPanel } from "./packages-panel";

/** Bookable services — salon + bookings industry (consult, clinic, venue). */
export default async function PackagesEditorPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);

  if (
    !canShowPackagesEditor({
      vertical: business.vertical,
      industryGroup: business.industryGroup,
      industryType: business.industryType,
    })
  ) {
    redirect("/editor");
  }

  const db = getPlatformDb();
  const packages = db
    ? await db.select().from(salonPackages).where(eq(salonPackages.businessId, business.id))
    : [];
  const gateway = await getTenantGatewayStatus(business.id);
  const payThenBookModule =
    business.industryGroup === "salon_beauty" || business.vertical === "salon"
      ? await hasModule(business.id, "sb.pay_then_book")
      : false;
  const isBookings = business.industryGroup === "bookings" || business.vertical === "clinic";
  const isFitness = business.industryGroup === "fitness";
  const isAuto = business.industryGroup === "automotive";
  const label = isAuto
    ? "Automotive"
    : isFitness
      ? "Fitness"
      : isBookings
        ? "Bookings"
        : "Your services";
  const heading = isAuto
    ? "Service packages"
    : isFitness
      ? "Classes & memberships"
      : isBookings
        ? "Services"
        : "Packages";
  const blurb = isAuto
    ? "Workshop and detailing packages. Free inspection slots without Razorpay. Not a car sales checkout."
    : isFitness
      ? "Memberships, group classes, and PT packs. Free trial booking works without Razorpay. Not a medical clinic."
      : isBookings
        ? "What clients book online. Free client bookings always allowed; pay-then-book is optional (tenant Razorpay). Clinic: license approval required before public book / publish."
        : "What clients book online. Free and pay-at-salon work without Razorpay; pay-then-book locks the slot for 15 minutes while they pay you via Checkout.";

  return (
    <>
      <EditorNav
        active="/editor/packages"
        vertical={business.vertical}
        industryGroup={business.industryGroup}
      />
      <PageShell className="py-4">
        <p className="premium-label">{label}</p>
        <h1 className="premium-heading mt-1 text-lg">{heading}</h1>
        <p className="premium-subtext mt-1.5 max-w-sm">{blurb}</p>
        <PackagesPanel
          businessId={business.id}
          packages={packages}
          razorpayConnected={gateway.connected}
          payThenBookModule={payThenBookModule}
        />
      </PageShell>
    </>
  );
}
