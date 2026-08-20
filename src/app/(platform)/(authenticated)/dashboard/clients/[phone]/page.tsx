import Link from "next/link";
import { PageShell } from "@/components/shared/page-shell";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { listShopOrdersAction } from "@/app/actions/shop-orders";
import { ShopOrdersBoard } from "../../orders/shop-orders-board";

export default async function ClientOrdersPage({ params }: { params: { phone: string } }) {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const phone = params.phone.replace(/\D/g, "").slice(-10);
  const listed = await listShopOrdersAction(business.id, phone);

  return (
    <PageShell className="py-4 pb-10">
      <Link href="/dashboard/clients" className="text-xs font-semibold text-brand-turquoise">
        ← All clients
      </Link>
      <h1 className="premium-heading mt-2 text-lg">Client {phone}</h1>
      <p className="premium-subtext mt-1.5 max-w-sm">
        Only this customer’s orders. Update delivery here. This is your shop data, not the ALINKS platform.
      </p>
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
