import { TenantAdminTable } from "@/components/admin/tenant-admin-table";
import { PageShell } from "@/components/shared/page-shell";
import { getSuperadminOverview } from "@/platform/admin/get-overview";

export default async function SuperadminTenantsPage() {
  const overview = await getSuperadminOverview();
  if (!overview) return null;

  return (
    <PageShell maxWidth="xl" className="py-10">
      <h1 className="text-3xl font-bold">Tenants</h1>
      <p className="mt-2 text-slate-400">{overview.tenants} accounts — change tier and status inline.</p>
      <div className="mt-6">
        <TenantAdminTable tenants={overview.tenantsList} />
      </div>
    </PageShell>
  );
}