import Link from "next/link";
import { PageShell } from "@/components/shared/page-shell";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { listShopClientsAction } from "@/app/actions/shop-orders";

export default async function ClientsDashboardPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const listed = await listShopClientsAction(business.id);
  const clients = listed.success ? listed.clients : [];

  return (
    <PageShell className="py-4 pb-10">
      <p className="premium-label">Your shop</p>
      <h1 className="premium-heading mt-1 text-lg">Clients</h1>
      <p className="premium-subtext mt-1.5 max-w-sm">
        People who ordered from you. They log in on your mini-site — not on ALINKS. Data is in your sheet.
      </p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <Link href="/dashboard/orders" className="rounded-full bg-brand-mist px-3 py-1 font-semibold">
          Orders
        </Link>
        <Link
          href={`/${business.handle}/account`}
          target="_blank"
          className="rounded-full bg-brand-mist px-3 py-1 font-semibold"
        >
          Client login page ↗
        </Link>
      </div>
      {!listed.success ? (
        <p className="mt-4 text-sm text-red-600">{listed.error}</p>
      ) : clients.length === 0 ? (
        <div className="premium-card mt-4 px-4 py-8 text-center">
          <p className="text-sm font-semibold">No clients yet</p>
          <p className="mt-1 text-xs text-brand-muted">A checkout creates the first client record in your Orders tab.</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {clients.map((c) => (
            <li key={c.phone}>
              <Link
                href={`/dashboard/clients/${c.phone}`}
                className="premium-card flex items-center justify-between gap-2 px-3 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-brand-ink">{c.name || "Customer"}</p>
                  <p className="text-[11px] text-brand-muted">{c.phone}</p>
                </div>
                <p className="text-xs font-semibold text-brand-muted">
                  {c.orderCount} order{c.orderCount === 1 ? "" : "s"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
