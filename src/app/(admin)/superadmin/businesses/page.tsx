import { BusinessAdminTable } from "@/components/admin/business-admin-table";
import { PageShell } from "@/components/shared/page-shell";
import { getSuperadminOverview } from "@/platform/admin/get-overview";

export default async function SuperadminBusinessesPage() {
  const overview = await getSuperadminOverview();
  if (!overview) return null;

  return (
    <PageShell maxWidth="xl" className="py-10">
      <h1 className="text-3xl font-bold">Businesses</h1>
      <p className="mt-2 text-slate-400">{overview.businesses} mini-sites — publish, vertical gates, checkout mode.</p>
      <div className="mt-6">
        <BusinessAdminTable businesses={overview.businessesList} />
      </div>
    </PageShell>
  );
}