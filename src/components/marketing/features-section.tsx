const modules = [
  { id: "commerce", name: "CommerceModule", desc: "WhatsApp Lite → Pro cart · UPI · COD · write-queue → Sheets" },
  { id: "booking", name: "AppointmentsEngine", desc: "Salon pay-then-book · clinic license gate · slot capacity" },
  { id: "routing", name: "TenantRouter", desc: "Path / subdomain / custom-domain · tier-gated surfaces" },
  { id: "ai", name: "AlinksAI", desc: "field_generate · seo_meta · share_caption · tier credit caps" },
  { id: "share", name: "TapBlast", desc: "Short links · QR · OG cards · click analytics (Pro+)" },
  { id: "publish", name: "PublishGate", desc: "Legal acceptances · trial expiry · day-15 unpublish (Q035)" },
];

export function FeaturesSection() {
  return (
    <section className="bg-zinc-950 py-16 text-white sm:py-24">
      <div className="marketing-container">
        <p className="tech-label">Platform modules</p>
        <h2 className="mt-3 text-2xl font-bold sm:text-3xl md:text-4xl">Composable tenant infrastructure</h2>
        <p className="mt-4 max-w-xl text-sm text-zinc-400">Feature flags and tier gates enforced server-side — not UI-only.</p>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <div
              key={m.id}
              className="group min-w-0 rounded-lg border border-tech-border bg-tech-panel p-5 transition-colors hover:border-tech-cyan/50 sm:p-6"
            >
              <p className="font-mono text-[10px] text-tech-cyan">{m.id}.ts</p>
              <h3 className="mt-2 font-mono text-sm font-semibold text-white">{m.name}</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}