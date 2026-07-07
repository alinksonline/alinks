import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckoutForm } from "@/components/tenant/checkout-form";
import { SiteHeader } from "@/components/tenant/site-header";
import { TenantFooter } from "@/components/tenant/tenant-footer";
import type { CartItem } from "@/core/types/commerce";
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
  const business = await getPublicBusinessByHandle(params.handle);
  if (!business || !canUseProCheckout(business.tier, business.checkoutMode ?? "lite")) notFound();

  let items: CartItem[] = [];
  try {
    if (searchParams.cart) items = JSON.parse(searchParams.cart) as CartItem[];
  } catch {
    items = [];
  }

  return (
    <>
      <SiteHeader business={business} />
      <main className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="mt-1 text-sm text-slate-500">{business.name}</p>
        <div className="mt-6">
          <CheckoutForm
            handle={params.handle}
            items={items}
            codEnabled={business.codEnabled ?? true}
            devMode={!isRazorpayConfigured()}
          />
        </div>
        <Link href={`/${params.handle}/store`} className="mt-6 inline-block text-sm underline">
          Back to store
        </Link>
      </main>
      <TenantFooter business={business} showAlinksBranding={shouldShowAlinksWatermark(business.tier)} />
    </>
  );
}