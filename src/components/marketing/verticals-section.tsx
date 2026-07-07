const verticals = [
  { code: "retail", label: "Retail / kirana", template: "catalog · GST · COD/UPI" },
  { code: "salon", label: "Salon / beauty", template: "packages · pay-then-book" },
  { code: "clinic", label: "Clinic / doctors", template: "license gate · doc slots" },
  { code: "portfolio", label: "Portfolio", template: "links · services · no inventory" },
];

export function VerticalsSection() {
  return (
    <section className="border-b border-zinc-200 bg-zinc-50 py-16 sm:py-24">
      <div className="marketing-container">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-zinc-400">Vertical templates</p>
        <h2 className="mt-3 text-2xl font-bold text-zinc-900 sm:text-3xl">Template_id → page graph</h2>

        <div className="mt-8 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3 sm:px-6">Code</th>
                <th className="px-4 py-3 sm:px-6">Vertical</th>
                <th className="px-4 py-3 sm:px-6">5-page graph</th>
              </tr>
            </thead>
            <tbody>
              {verticals.map((v) => (
                <tr key={v.code} className="border-b border-zinc-50 last:border-0 hover:bg-cyan-50/40">
                  <td className="px-4 py-4 font-mono text-xs text-tech-cyan sm:px-6">{v.code}</td>
                  <td className="px-4 py-4 font-medium text-zinc-900 sm:px-6">{v.label}</td>
                  <td className="px-4 py-4 font-mono text-xs text-zinc-500 sm:px-6">{v.template}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}