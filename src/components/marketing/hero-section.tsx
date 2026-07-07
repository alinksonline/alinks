import Link from "next/link";
import { TerminalPanel } from "@/components/marketing/terminal-panel";
import { Button } from "@/components/ui/button";

const metrics = [
  { label: "pages/tenant", value: "5" },
  { label: "p99 route", value: "<50ms" },
  { label: "PII in platform DB", value: "0" },
  { label: "regions", value: "IN·SG·AE" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-tech-border bg-tech-bg text-white">
      <div className="pointer-events-none absolute inset-0 tech-grid-bg opacity-60" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="marketing-container relative py-16 sm:py-20 lg:py-28">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="tech-label">v0.1.0 · phase 2 ready</span>
          <span className="rounded border border-tech-border bg-tech-panel px-2 py-0.5 font-mono text-[10px] text-zinc-400">
            Next.js 14 · Drizzle · Postgres
          </span>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-12">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl lg:text-[3.25rem]">
              Multi-tenant infrastructure
              <br />
              <span className="bg-gradient-to-r from-tech-cyan to-emerald-400 bg-clip-text text-transparent">
                for Indian SMB sites.
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-zinc-400 sm:text-base">
              ALINKS is Artix&apos;s hosted platform layer: tenant routing, publish gates, commerce pipes, and
              dashboard APIs. Client PII stays in tenant Google Sheets or BYO Supabase — never in platform Postgres.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button className="w-full border border-tech-cyan/30 bg-tech-cyan/10 px-6 py-3 font-mono text-xs uppercase tracking-wider text-tech-cyan hover:bg-tech-cyan/20 sm:w-auto">
                  Deploy trial →
                </Button>
              </Link>
              <Link href="/demo" className="w-full sm:w-auto">
                <Button
                  variant="ghost"
                  className="w-full border border-tech-border px-6 py-3 font-mono text-xs text-zinc-400 hover:bg-tech-panel sm:w-auto"
                >
                  /demo tenant
                </Button>
              </Link>
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-4 border-t border-tech-border pt-8 sm:grid-cols-4">
              {metrics.map((m) => (
                <div key={m.label} className="min-w-0">
                  <dt className="truncate font-mono text-[10px] uppercase tracking-wider text-zinc-500">{m.label}</dt>
                  <dd className="mt-1 font-mono text-lg font-semibold text-white sm:text-xl">{m.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="min-w-0 lg:sticky lg:top-24">
            <TerminalPanel />
            <p className="mt-3 font-mono text-[10px] text-zinc-600">
              {"// middleware → resolveRequest() → tenant surface"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}