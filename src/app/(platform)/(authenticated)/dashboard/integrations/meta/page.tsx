import { getEnv } from "@/core/config/env";
import { PageShell } from "@/components/shared/page-shell";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";

export default async function MetaCatalogPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const env = getEnv();
  const feedUrl = `${env.NEXT_PUBLIC_APP_URL}/api/meta/catalog/${business.handle}`;

  return (
    <PageShell maxWidth="md" className="py-10">
      <h1 className="text-2xl font-bold">Meta Catalog</h1>
      <p className="mt-2 text-sm text-slate-600">
        Product feed for Meta Commerce Manager. Site must be published and catalog enabled.
      </p>
      <div className="mt-6 rounded-lg border bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Catalog feed URL</p>
        <p className="mt-2 break-all font-mono text-sm">{feedUrl}</p>
        <ul className="mt-4 space-y-1 text-sm text-slate-600">
          <li>Published: {business.isPublished ? "Yes" : "No"}</li>
          <li>Meta catalog enabled: {business.metaCatalogEnabled ? "Yes" : "No"}</li>
        </ul>
      </div>
    </PageShell>
  );
}