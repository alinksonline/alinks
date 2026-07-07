import { PlanPricingCards } from "@/components/shared/plan-pricing-cards";

export function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-16 border-t border-tech-border bg-tech-bg py-16 text-white sm:scroll-mt-20 sm:py-24">
      <div className="marketing-container">
        <p className="tech-label">billing.tiers</p>
        <h2 className="mt-3 text-2xl font-bold sm:text-3xl md:text-4xl">Subscription plans</h2>
        <p className="mt-4 max-w-lg text-sm text-zinc-400">
          Single source of truth for Basic · Pro · Enterprise. Monthly list or annual upfront (Q033/Q034).
        </p>
        <div className="mt-10 sm:mt-12">
          <PlanPricingCards variant="marketing" defaultCycle="annual" />
        </div>
      </div>
    </section>
  );
}