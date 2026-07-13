import { PlanPricingCards } from "@/components/shared/plan-pricing-cards";

export function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-16 bg-[#050505] py-24 relative overflow-hidden border-t border-white/5">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-brand-turquoise/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="app-container relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-turquoise mb-3">Plans</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">Simple pricing for Indian SMBs</h2>
          <p className="text-lg text-white/60">
            Basic, Pro, and Enterprise. Annual plans save more — founders lock for early adopters.
          </p>
        </div>
        
        <div className="mt-12">
          {/* PlanPricingCards component should ideally have a dark mode or transparent bg variant to fit in seamlessly */}
          <PlanPricingCards variant="marketing" defaultCycle="annual" />
        </div>
      </div>
    </section>
  );
}