import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckoutForm } from "@/components/tenant/checkout-form";
import { SiteHeader } from "@/components/tenant/site-header";
import { TenantFooter } from "@/components/tenant/tenant-footer";
import { TenantThemedLayout } from "@/components/tenant/tenant-themed-layout";
import type { CartItem } from "@/core/types/commerce";
import { parseBusinessProfile } from "@/core/types/business-profile";
import { shouldShowAlinksWatermark } from "@/core/utils/branding";
import { canUseProCheckout } from "@/core/utils/tier-gates";
import { isRazorpayConfigured } from "@/platform/payments/razorpay";
import { getPublicBusinessByHandle } from "@/tenant/site/get-public-business";

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: { handle: string };
  searchParams: { cart?: string };
}) {
  const row = await getPublicBusinessByHandle(params.handle);
  if (!row || !canUseProCheckout(row.tier, row.checkoutMode ?? "lite")) notFound();

  let items: CartItem[] = [];
  try {
    if (searchParams.cart) items = JSON.parse(searchParams.cart) as CartItem[];
  } catch {
    items = [];
  }

  const profile = parseBusinessProfile(row.branding, row.name);
  const business = { ...row, profile };

  return (
    <TenantThemedLayout theme={business.theme}>
      <SiteHeader business={business} profile={profile} />
      <main className="mx-auto max-w-app px-3.5 py-6">
        <h1 className="t-ink text-lg font-bold">Checkout</h1>
        <p className="t-muted mt-0.5 text-xs">{business.name}</p>
        <div className="mt-4">
          <CheckoutForm
            handle={params.handle}
            items={items}
            codEnabled={business.codEnabled ?? true}
            devMode={!isRazorpayConfigured()}
          />
        </div>
        <Link href={`/${params.handle}/store`} className="t-link mt-5 inline-block text-xs">
          Back to store
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
