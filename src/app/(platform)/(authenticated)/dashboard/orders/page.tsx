import Link from "next/link";
import { PageShell } from "@/components/shared/page-shell";
import { canShowFoodMenu } from "@/core/utils/industry-gates";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { listFoodOrdersAction } from "@/app/actions/food-ops";
import { listShopOrdersAction } from "@/app/actions/shop-orders";
import { FoodOrdersBoard } from "./food-orders-board";
import { ShopOrdersBoard } from "./shop-orders-board";

export default async function OrdersDashboardPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);

  if (
    canShowFoodMenu({
      vertical: business.vertical,
      industryGroup: business.industryGroup,
    })
  ) {
    const orders = await listFoodOrdersAction(business.id, false);
    return (
      <PageShell className="py-4 pb-10">
        <p className="premium-label">Kitchen board</p>
        <h1 className="premium-heading mt-1 text-lg">Orders</h1>
        <p className="premium-subtext mt-1.5 max-w-sm">
          Pickup · delivery · dine-in tickets. Customer phone lives in Sheets.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href="/editor/menu" className="rounded-full bg-brand-mist px-3 py-1 font-semibold">
            Menu & channels
          </Link>
          <Link href="/dashboard/clients" className="rounded-full bg-brand-mist px-3 py-1 font-semibold">
            Clients
          </Link>
        </div>
        <FoodOrdersBoard businessId={business.id} orders={orders} />
      </PageShell>
    );
  }

  const listed = await listShopOrdersAction(business.id);

  return (
    <PageShell className="py-4 pb-10">
      <p className="premium-label">Your shop</p>
      <h1 className="premium-heading mt-1 text-lg">Orders</h1>
      <p className="premium-subtext mt-1.5 max-w-sm">
        Customer checkouts from Products and Services. Rows live in your Google Sheet / storage — not ALINKS.
      </p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <Link href="/dashboard/clients" className="rounded-full bg-brand-mist px-3 py-1 font-semibold">
          Clients
        </Link>
        <Link href="/editor/products" className="rounded-full bg-brand-mist px-3 py-1 font-semibold">
          Products & services
        </Link>
        <Link
          href={`/${business.handle}/account`}
          target="_blank"
          className="rounded-full bg-brand-mist px-3 py-1 font-semibold"
        >
          Client login ↗
        </Link>
      </div>
      {!listed.success ? (
        <p className="mt-4 text-sm text-red-600">{listed.error}</p>
      ) : (
        <ShopOrdersBoard
          businessId={business.id}
          orders={listed.orders}
          deliveryOps={business.deliveryOps === "third_party" ? "third_party" : "manual"}
          deliveryPartnerName={business.deliveryPartnerName ?? ""}
        />
      )}
    </PageShell>
  );
}
