import Link from "next/link";
import { PageShell } from "@/components/shared/page-shell";
import { canShowFoodMenu } from "@/core/utils/industry-gates";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { listFoodOrdersAction } from "@/app/actions/food-ops";
import { FoodOrdersBoard } from "./food-orders-board";

export default async function OrdersDashboardPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);

  if (
    !canShowFoodMenu({
      vertical: business.vertical,
      industryGroup: business.industryGroup,
    })
  ) {
    return (
      <PageShell className="py-8">
        <h1 className="premium-heading text-lg">Orders</h1>
        <p className="premium-subtext mt-2">Food order board is for food industry kitchens.</p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm font-semibold text-brand-turquoise">
          ← Dashboard
        </Link>
      </PageShell>
    );
  }

  const orders = await listFoodOrdersAction(business.id, false);

  return (
    <PageShell className="py-4 pb-10">
      <p className="premium-label">Kitchen board</p>
      <h1 className="premium-heading mt-1 text-lg">Orders</h1>
      <p className="premium-subtext mt-1.5 max-w-sm">
        Pickup · delivery · dine-in tickets. Riders are yours (not Artix fleet). Customer phone lives in
        Sheets.
      </p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <Link href="/editor/menu" className="rounded-full bg-brand-mist px-3 py-1 font-semibold">
          Menu & channels
        </Link>
        <Link
          href={`/${business.handle}/menu`}
          target="_blank"
          className="rounded-full bg-brand-mist px-3 py-1 font-semibold"
        >
          Public menu ↗
        </Link>
      </div>
      <FoodOrdersBoard businessId={business.id} orders={orders} />
    </PageShell>
  );
}
