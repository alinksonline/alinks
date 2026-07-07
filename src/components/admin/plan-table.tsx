import type { PhaseSummary, PlanTaskStatus } from "@/platform/admin/plan-tracker";
import { getPhaseProgress } from "@/platform/admin/plan-tracker";

const STATUS_STYLES: Record<PlanTaskStatus, string> = {
  done: "bg-emerald-900/50 text-emerald-300",
  partial: "bg-amber-900/50 text-amber-300",
  pending: "bg-slate-800 text-slate-400",
  external: "bg-violet-900/50 text-violet-300",
};

export function PlanTable({ phases }: { phases: PhaseSummary[] }) {
  return (
    <div className="space-y-8">
      {phases.map((phase) => {
        const progress = getPhaseProgress(phase);
        return (
          <section key={phase.phase}>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold">Phase {phase.phase} — {phase.name}</h2>
                <p className="text-sm text-slate-400">Gate: {phase.gate}</p>
              </div>
              <span className="text-sm font-bold text-emerald-400">{progress.done}/{progress.total} ({progress.percent}%)</span>
            </div>
            <div className="mt-3 overflow-hidden rounded-lg border border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900 text-xs uppercase text-slate-500">
                  <tr><th className="px-4 py-2">ID</th><th className="px-4 py-2">Task</th><th className="px-4 py-2">Status</th><th className="px-4 py-2">Notes</th></tr>
                </thead>
                <tbody>
                  {phase.tasks.map((task) => (
                    <tr key={task.id} className="border-t border-slate-800 bg-slate-950/50">
                      <td className="px-4 py-2 font-mono text-xs text-slate-400">{task.id}</td>
                      <td className="px-4 py-2">{task.title}{task.gate && <span className="ml-2 text-xs text-sky-400">GATE</span>}</td>
                      <td className="px-4 py-2"><span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${STATUS_STYLES[task.status]}`}>{task.status}</span></td>
                      <td className="px-4 py-2 text-slate-400">{task.notes ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
