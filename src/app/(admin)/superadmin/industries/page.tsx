import { PageShell } from "@/components/shared/page-shell";
import { getIndustriesAdminDataAction } from "@/app/actions/industries-admin";
import { IndustriesAdminClient } from "./industries-admin-client";

export default async function SuperadminIndustriesPage() {
  const data = await getIndustriesAdminDataAction();

  return (
    <PageShell maxWidth="xl" className="py-10">
      <h1 className="text-3xl font-bold tracking-tight">Industries & modules</h1>
      <p className="mt-2 max-w-2xl text-slate-400">
        Enable industries, set Creator Partner discount defaults, and override module prices. Tenants pay only
        for selected modules (UI: &quot;Select modules&quot; — never &quot;à la carte&quot;).
      </p>
      {!data.success ? (
        <p className="mt-8 text-red-400">{data.error ?? "Could not load catalog"}</p>
      ) : (
        <IndustriesAdminClient industries={data.industries} catalog={data.catalog} />
      )}
    </PageShell>
  );
}
