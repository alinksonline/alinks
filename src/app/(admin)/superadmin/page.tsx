import Link from "next/link";
import { StatCard } from "@/components/admin/stat-card";
import { PageShell } from "@/components/shared/page-shell";
import { getSuperadminOverview } from "@/platform/admin/get-overview";
import { EXTERNAL_BLOCKERS, getPlanProgress, IMPLEMENTATION_PLAN } from "@/platform/admin/plan-tracker";
import { getPhaseProgress } from "@/platform/admin/plan-tracker";

export default async function SuperadminOverviewPage() {
  const overview = await getSuperadminOverview();
  const progress = getPlanProgress();

  if (!overview) {
    return (
      <PageShell maxWidth="xl" className="py-10">
        <p className="text-slate-400">Database not connected.</p>
      </PageShell>
    );
  }

  return (
    <PageShell maxWidth="xl" className="py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Superadmin overview</h1>
          <p className="mt-2 text-slate-400">Platform config only — no client PII in Postgres.</p>
        </div>
        <Link href="/superadmin/plan" className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold hover:bg-sky-500">
          View full implementation plan
        </Link>
      </div>

      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Implementation progress (Phases 0–4)</h2>
          <span className="text-2xl font-bold text-emerald-400">{progress.percent}%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full bg-emerald-500" style={{ width: `${progress.percent}%` }} />
        </div>
        <p className="mt-2 text-sm text-slate-400">
          {progress.done} done · {progress.partial} partial · {progress.pending} pending · {EXTERNAL_BLOCKERS.length} external blockers
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-5">
          {IMPLEMENTATION_PLAN.map((phase) => {
            const p = getPhaseProgress(phase);
            return (
              <div key={phase.phase} className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm">
                <p className="font-medium">Phase {phase.phase}</p>
                <p className="text-xs text-slate-500">{phase.name}</p>
                <p className="mt-1 text-emerald-400">{p.percent}%</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tenants" value={overview.tenants} hint={`${overview.statusCounts.trial} trial`} />
        <StatCard label="Businesses" value={overview.businesses} hint={`${overview.published} published`} />
        <StatCard label="Pro checkout" value={overview.proCheckout} />
        <StatCard label="Paid checkouts" value={overview.paidCheckouts} />
        <StatCard label="Pending licenses" value={overview.pendingLicenses} hint="Clinic NMC queue" />
        <StatCard label="Pending ads" value={overview.pendingAds} />
        <StatCard label="Pending pharmacy" value={overview.pendingPharmacy} />
        <StatCard label="Write queue" value={overview.writeQueueCount} />
        <StatCard label="Share links" value={overview.shareLinks} />
        <StatCard label="Staff roster" value={overview.staffMembers} />
        <StatCard label="Supabase connectors" value={overview.supabaseConnectors} />
        <StatCard label="AI calls (month)" value={overview.aiCallsThisMonth} />
        <StatCard label="Promo redemptions" value={overview.promoRedemptions} />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Tier breakdown</h2>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-slate-800 px-3 py-1">Basic: {overview.tierCounts.basic}</span>
          <span className="rounded-full bg-slate-800 px-3 py-1">Pro: {overview.tierCounts.pro}</span>
          <span className="rounded-full bg-slate-800 px-3 py-1">Enterprise: {overview.tierCounts.enterprise}</span>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">External launch blockers</h2>
        <ul className="mt-3 space-y-2">
          {EXTERNAL_BLOCKERS.map((b) => (
            <li key={b.id} className="flex items-center gap-2 rounded-lg border border-violet-900/50 bg-violet-950/30 px-4 py-2 text-sm">
              <span className="text-violet-400">☐</span>
              <span>{b.title}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10 flex flex-wrap gap-3 text-sm">
        <Link href="/superadmin/compliance" className="underline text-sky-400">Compliance queues →</Link>
        <Link href="/superadmin/tenants" className="underline text-sky-400">Manage tenants →</Link>
        <Link href="/superadmin/businesses" className="underline text-sky-400">Manage businesses →</Link>
        <Link href="/dashboard" className="underline text-slate-400">Tenant dashboard</Link>
      </div>
    </PageShell>
  );
}