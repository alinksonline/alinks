const codeSnippet = `// Platform Postgres — config only
tenants · businesses · sessions
legal_acceptances · billing_tier

// Tenant data — StorageAdapter
Google Sheets  → orders, bookings, customers
Supabase (Ent) → tenant BYO database`;

const layers = [
  {
    id: "edge",
    title: "Edge routing",
    tech: "middleware.ts · resolveRequest()",
    desc: "Path, subdomain, and custom-domain resolution. Headers: x-alinks-surface, x-alinks-handle.",
  },
  {
    id: "platform",
    title: "Platform Postgres",
    tech: "Drizzle ORM · Artix-owned",
    desc: "Tenant config, publish state, tier gates, legal logs. No customer, patient, or order PII.",
  },
  {
    id: "tenant",
    title: "Tenant storage",
    tech: "StorageAdapter · write-queue",
    desc: "Sheets default. Retry queue on failure. Enterprise can attach Supabase connector.",
  },
];

export function ArchitectureSection() {
  return (
    <section className="border-b border-zinc-200 bg-white py-16 sm:py-24">
      <div className="marketing-container">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-emerald-600">System design</p>
        <h2 className="mt-3 text-2xl font-bold text-zinc-900 sm:text-3xl md:text-4xl">Three-layer data boundary</h2>
        <p className="mt-4 max-w-2xl text-sm text-zinc-600 sm:text-base">
          Locked in src/ARCHITECTURE.txt — platform DB for config, tenant storage for client rows.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
          <div className="space-y-4">
            {layers.map((layer) => (
              <div
                key={layer.id}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-5 transition-colors hover:border-tech-cyan/40 hover:bg-cyan-50/30 sm:p-6"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-tech-cyan">
                    {layer.id}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-400">{layer.tech}</span>
                </div>
                <h3 className="mt-2 font-semibold text-zinc-900">{layer.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{layer.desc}</p>
              </div>
            ))}
          </div>

          <div className="tech-panel min-w-0 overflow-hidden bg-tech-bg">
            <div className="border-b border-tech-border px-4 py-2 font-mono text-[10px] text-zinc-500">
              data-ownership.ts
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-zinc-300 sm:text-xs">
              {codeSnippet}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}