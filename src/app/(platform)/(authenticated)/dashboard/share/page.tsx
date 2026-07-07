import { getEnv } from "@/core/config/env";
import { PageShell } from "@/components/shared/page-shell";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { getShareLinksForBusiness } from "@/app/actions/share";
import { ShareHubForm } from "./share-hub-form";

export default async function ShareHubPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const links = await getShareLinksForBusiness(business.id);
  const env = getEnv();
  const storeUrl = `${env.NEXT_PUBLIC_APP_URL}/${business.handle}/store`;

  return (
    <PageShell maxWidth="md" className="py-10">
      <h1 className="text-2xl font-bold">Tap & Blast</h1>
      <p className="mt-2 text-sm text-slate-600">Short links, WhatsApp share targets, and click analytics.</p>
      <ShareHubForm businessId={business.id} storeUrl={storeUrl} handle={business.handle} />
      <div className="mt-8">
        <h2 className="font-semibold">Your short links</h2>
        {links.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No links yet. Create one above.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {links.map((l) => (
              <li key={l.id} className="rounded-lg border bg-white px-3 py-2">
                <span className="font-mono">{env.NEXT_PUBLIC_APP_URL}/s/{l.code}</span>
                <span className="ml-2 text-slate-500">{l.label ?? l.targetUrl}</span>
                <span className="ml-2 text-slate-400">({l.clicks} clicks)</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  );
}
