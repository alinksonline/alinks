import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const highlights = [
  { label: "Pages per site", value: "5" },
  { label: "Pro trial", value: "14 days" },
  { label: "Built for", value: "India" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-transparent pb-16 pt-10">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-premium-mesh opacity-80" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-purple/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="app-container relative z-10 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 glass-panel mb-6">
          <span className="w-2 h-2 rounded-full bg-brand-turquoise animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-white/80">Mobile-First Mini-Sites</span>
        </div>

        <h1 className="text-balance font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white mb-6">
          Your business website,<br />
          <span className="text-gradient-electric">premium on every phone.</span>
        </h1>
        
        <p className="max-w-md mx-auto text-base md:text-lg text-white/70 mb-10 leading-relaxed">
          ALINKS helps Indian salons, clinics, and shops launch a beautiful 5-page site with bookings,
          checkout, and WhatsApp sharing — all from your phone.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 mb-14">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-white text-black hover:bg-white/90 h-12 px-8 rounded-full font-bold text-sm transition-all duration-300 hover:scale-105 neon-glow">
              Start 14-day Pro trial
            </Button>
          </Link>
          <Link href="/demo" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-white/5 border border-white/10 hover:bg-white/10 text-white h-12 px-8 rounded-full font-semibold text-sm backdrop-blur-md transition-all duration-300 hover:scale-105">
              View demo store
            </Button>
          </Link>
        </div>

        {/* Hero Image Device */}
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[320px] overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl neon-glow animate-float">
          <Image
            src="/assets/marketing/marketing_hero.png"
            alt="ALINKS mobile mini-site preview on phone"
            fill
            className="object-cover"
            priority
            sizes="320px"
          />
        </div>

        {/* Metrics Grid */}
        <dl className="mt-16 grid grid-cols-3 gap-4 w-full max-w-lg mx-auto">
          {highlights.map((h) => (
            <div key={h.label} className="glass-panel px-4 py-4 text-center rounded-2xl flex flex-col justify-center transition-all hover:bg-white/5">
              <dt className="text-[10px] font-medium uppercase tracking-widest text-white/50">{h.label}</dt>
              <dd className="mt-2 font-display text-xl md:text-2xl font-bold text-gradient-electric">{h.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}