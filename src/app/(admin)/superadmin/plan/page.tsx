import { PlanTable } from "@/components/admin/plan-table";
import { PageShell } from "@/components/shared/page-shell";
import { EXTERNAL_BLOCKERS, getPlanProgress, IMPLEMENTATION_PLAN } from "@/platform/admin/plan-tracker";

export default function SuperadminPlanPage() {
  const progress = getPlanProgress();

  return (
    <PageShell maxWidth="xl" className="py-10">
      <h1 className="text-3xl font-bold tracking-tight">Full implementation plan</h1>
      <p className="mt-2 text-slate-400">
        ALINKS Phases 0–4 from ALINKS_IMPLEMENTATION_PLAN.txt — code status as of today.
      </p>
      <p className="mt-4 text-sm text-emerald-400">
        Code complete: {progress.done}/{progress.total} tasks ({progress.percent}%)
      </p>

      <div className="mt-8">
        <PlanTable phases={IMPLEMENTATION_PLAN} />
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">External blockers (not code)</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {EXTERNAL_BLOCKERS.map((b) => (
            <li key={b.id} className="rounded-lg border border-violet-900/50 bg-violet-950/30 px-4 py-3">
              {b.id} — {b.title}
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}