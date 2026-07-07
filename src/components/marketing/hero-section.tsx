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
    <section className="relative overflow-hidden bg-premium-radial">
      <div className="app-container pb-8 pt-6">
        <p className="premium-label">Mobile-first mini-sites</p>
        <h1 className="premium-heading mt-3 text-balance font-display text-[1.75rem]">
          Your business website,
          <span className="bg-brand-gradient bg-clip-text text-transparent"> premium on every phone.</span>
        </h1>
        <p className="premium-subtext mt-4 max-w-sm">
          ALINKS helps Indian salons, clinics, and shops launch a beautiful 5-page site with bookings,
          checkout, and WhatsApp sharing — all from your phone.
        </p>

        <div className="relative mx-auto mt-8 aspect-[4/5] w-full max-w-[280px] overflow-hidden rounded-3xl border border-brand-ink/[0.08] shadow-premium bronze-glow">
          <Image
            src="/assets/marketing/hero-device-showcase.jpg"
            alt="ALINKS mobile mini-site preview on phone"
            fill
            className="object-cover"
            priority
            sizes="280px"
          />
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link href="/signup">
            <Button variant="bronze">Start 14-day Pro trial</Button>
          </Link>
          <Link href="/demo">
            <Button variant="ghost">View demo store</Button>
          </Link>
        </div>

        <dl className="mt-8 grid grid-cols-3 gap-3">
          {highlights.map((h) => (
            <div key={h.label} className="premium-card-soft px-3 py-3 text-center">
              <dt className="text-[10px] font-medium uppercase tracking-wide text-brand-ink/45">{h.label}</dt>
              <dd className="mt-1 font-display text-lg font-bold text-brand-ink">{h.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}