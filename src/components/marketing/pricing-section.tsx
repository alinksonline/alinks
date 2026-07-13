import { PlanPricingCards } from "@/components/shared/plan-pricing-cards";

export function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-16 border-t border-brand-ink/[0.06] bg-brand-ink py-10 text-brand-cream">
      <div className="app-container">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-turquoise-light">Plans</p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">Simple pricing for Indian SMBs</h2>
        <p className="mt-3 text-sm text-brand-cream/70">
          Basic, Pro, and Enterprise. Annual plans save more — founders lock for early adopters.
        </p>
        <div className="mt-8">
          <PlanPricingCards variant="marketing" defaultCycle="annual" />
        </div>
      </div>
    </section>
  );
}