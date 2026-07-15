import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckoutForm } from "@/components/tenant/checkout-form";
import { SiteHeader } from "@/components/tenant/site-header";
import { TenantFooter } from "@/components/tenant/tenant-footer";
import { TenantThemedLayout } from "@/components/tenant/tenant-themed-layout";
import { PublicSiteNav } from "@/components/tenant/public-site-nav";
import type { CartItem } from "@/core/types/commerce";
import { parseBusinessProfile } from "@/core/types/business-profile";
import { shouldShowAlinksWatermark } from "@/core/utils/branding";
import { canUseProCheckout } from "@/core/utils/tier-gates";
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

      <section className="t-page-hero">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: "var(--t-primary-text, var(--t-primary))" }}
        >
          Checkout
        </p>
        <h1 className="t-ink mt-1.5 text-2xl font-bold tracking-tight">Complete your order</h1>
        <p className="t-muted mt-1.5 max-w-sm text-sm leading-relaxed">
          {business.name} · orders save to the shop&apos;s Google Sheet
        </p>
      </section>

      <main className="mx-auto max-w-app px-3.5 py-5 pb-4">
        {items.length === 0 ? (
          <div className="t-card px-4 py-10 text-center">
            <p className="t-ink text-sm font-semibold">Your cart is empty</p>
            <Link href={`/${params.handle}/store`} className="t-btn-primary mt-4">
              Back to shop
            </Link>
          </div>
        ) : (
          <CheckoutForm
            handle={params.handle}
            items={items}
            codEnabled={business.codEnabled ?? true}
            onlinePayEnabled={Boolean(business.onlinePayEnabled)}
          />
        )}
        <div className="mt-5 text-center">
          <Link href={`/${params.handle}/store`} className="t-link text-xs font-semibold no-underline">
            ← Back to store
          </Link>
        </div>
      </main>

      <TenantFooter
        business={business}
        profile={profile}
        showAlinksBranding={shouldShowAlinksWatermark(business.tier)}
      />
      <PublicSiteNav handle={params.handle} vertical={business.vertical} slug="home" path="checkout" />
    </TenantThemedLayout>
  );
}
