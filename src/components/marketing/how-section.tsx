const pipeline = [
  { step: "auth.verifyOtp()", output: "session · role · tenant_id" },
  { step: "onboarding.seed()", output: "handle · template · 5 pages" },
  { step: "publishGate.check()", output: "legal · tier · trial" },
  { step: "storage.write()", output: "Sheet append · retry queue" },
];

export function HowSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="marketing-container">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-emerald-600">Tenant pipeline</p>
        <h2 className="mt-3 text-2xl font-bold text-zinc-900 sm:text-3xl">Request → publish → write</h2>

        <div className="mt-10 space-y-0">
          {pipeline.map((p, i) => (
            <div key={p.step} className="flex min-w-0 flex-col gap-2 border-l-2 border-tech-cyan/40 py-5 pl-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-zinc-400">{String(i + 1).padStart(2, "0")}</span>
                <code className="break-all font-mono text-sm text-zinc-900">{p.step}</code>
              </div>
              <span className="font-mono text-xs text-zinc-500 sm:text-right">→ {p.output}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}