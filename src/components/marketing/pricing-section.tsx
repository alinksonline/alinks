import { PlanPricingCards } from "@/components/shared/plan-pricing-cards";

export function PricingSection() {
  return (
    <section id="pricing" className="relative scroll-mt-16 border-t border-white/5 bg-[#050505] py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050505] to-[#08080c]"
        aria-hidden
      />
      <div className="app-container relative z-10">
        <div className="mb-4 inline-block rounded-full border border-brand-turquoise/30 bg-brand-turquoise/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-turquoise-light">
          Plans
        </div>
        <h2 className="mb-3 font-display text-3xl font-bold text-white">
          Simple pricing for Indian SMBs
        </h2>
        <p className="mb-10 text-sm leading-relaxed text-zinc-400">
          Basic, Pro, and Enterprise. Annual plans save more — founders lock for early adopters.
        </p>
        <PlanPricingCards variant="marketing" defaultCycle="annual" />
      </div>
    </section>
  );
}
