import Link from "next/link";
import { getAnalyticsDashboardAction } from "@/app/actions/analytics";
import { PageShell } from "@/components/shared/page-shell";
import { ANALYTICS_DASHBOARD_DAYS, ANALYTICS_LITE_SKU } from "@/core/config/analytics";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";

export default async function AnalyticsDashboardPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const result = await getAnalyticsDashboardAction(business.id);

  return (
    <PageShell maxWidth="md" className="py-10">
      <p className="premium-label">Insights</p>
      <h1 className="mt-1 text-2xl font-bold text-brand-ink">Analytics lite</h1>
      <p className="mt-2 text-sm text-brand-muted">
        Aggregated page views and link clicks — no visitor names, phones, or IPs. Last{" "}
        {ANALYTICS_DASHBOARD_DAYS} days.
      </p>

      {!result.success ? (
        <p className="mt-6 text-sm text-red-600">{result.error}</p>
      ) : !result.entitled ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-semibold">Module not active</p>
          <p className="mt-1">
            Add <strong>Analytics lite</strong> ({ANALYTICS_LITE_SKU}) under Billing → Select modules
            to start counting views and outbound link taps.
          </p>
          <Link href="/billing" className="mt-3 inline-block font-semibold underline">
            Select modules
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Page views" value={result.summary.pageViews} />
            <StatCard label="Link clicks" value={result.summary.linkClicks} />
          </div>

          <section className="rounded-2xl border border-brand-ink/10 bg-white p-4">
            <h2 className="text-sm font-semibold text-brand-ink">Top pages</h2>
            {result.summary.topPaths.length === 0 ? (
              <p className="mt-2 text-sm text-brand-muted">No page views yet. Share your public link.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {result.summary.topPaths.map((p) => (
                  <li key={p.pathKey} className="flex justify-between gap-2">
                    <span className="font-mono text-xs text-brand-ink">{p.pathKey}</span>
                    <span className="font-semibold tabular-nums">{p.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-brand-ink/10 bg-white p-4">
            <h2 className="text-sm font-semibold text-brand-ink">Top links</h2>
            {result.summary.topLinks.length === 0 ? (
              <p className="mt-2 text-sm text-brand-muted">
                Outbound / WhatsApp / tel links on your site are counted when visitors tap them.
              </p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {result.summary.topLinks.map((p) => (
                  <li key={p.pathKey} className="flex justify-between gap-2">
                    <span className="max-w-[70%] truncate font-mono text-xs text-brand-ink">
                      {p.pathKey.replace(/^link:/, "")}
                    </span>
                    <span className="font-semibold tabular-nums">{p.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {result.summary.byDay.length > 0 ? (
            <section className="rounded-2xl border border-brand-ink/10 bg-white p-4">
              <h2 className="text-sm font-semibold text-brand-ink">By day</h2>
              <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto text-xs">
                {[...result.summary.byDay].reverse().map((d) => (
                  <li key={d.day} className="flex justify-between gap-2 font-mono text-brand-muted">
                    <span>{d.day}</span>
                    <span>
                      v{d.pageViews} · c{d.linkClicks}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </PageShell>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-brand-ink/10 bg-white p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold text-brand-ink">{value.toLocaleString("en-IN")}</p>
    </div>
  );
}
