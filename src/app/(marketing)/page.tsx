import { CtaSection } from "@/components/marketing/cta-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { HowSection } from "@/components/marketing/how-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { VerticalsSection } from "@/components/marketing/verticals-section";

export default function MarketingPage() {
  return (
    <main className="min-w-0 overflow-x-hidden bg-brand-cream dark:bg-[#050505]">
      <HeroSection />
      <FeaturesSection />
      <VerticalsSection />
      <HowSection />
      <PricingSection />
      <CtaSection />
    </main>
  );
}
