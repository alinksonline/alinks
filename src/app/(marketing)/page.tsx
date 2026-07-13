import { CtaSection } from "@/components/marketing/cta-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { HowSection } from "@/components/marketing/how-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { VerticalsSection } from "@/components/marketing/verticals-section";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function MarketingHeader() {
  return (
    <header className="absolute top-0 w-full z-50 py-6">
      <div className="app-container flex justify-between items-center">
        {/* Logo or Brand Name */}
        <Link href="/" className="font-display text-2xl font-bold tracking-tight text-white hover:text-brand-turquoise transition-colors">
          ALINKS
        </Link>
        
        {/* Login Section */}
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:text-brand-turquoise hover:bg-white/5">
              Login
            </Button>
          </Link>
          <Link href="/signup" className="hidden sm:inline-block">
            <Button variant="primary" className="rounded-full h-10 px-6 bg-brand-turquoise text-black font-semibold hover:bg-brand-turquoise-light border-none shadow-[0_0_15px_rgba(45,212,191,0.3)]">
              Sign up
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function MarketingPage() {
  return (
    <main className="min-w-0 overflow-x-hidden dark bg-[#09090b] text-white relative">
      <MarketingHeader />
      <HeroSection />
      <FeaturesSection />
      <VerticalsSection />
      <HowSection />
      <PricingSection />
      <CtaSection />
    </main>
  );
}