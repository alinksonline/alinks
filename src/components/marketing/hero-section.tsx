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
    <section className="relative overflow-hidden bg-[#050505] pb-12 pt-8">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-full -translate-x-1/2 rounded-full bg-brand-purple/20 opacity-60 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-0 top-1/2 h-64 w-64 rounded-full bg-brand-turquoise/10 opacity-40 blur-[80px]"
        aria-hidden
      />

      <div className="app-container relative z-10">
        <div className="mb-6 inline-block rounded-full border border-brand-turquoise/30 bg-brand-turquoise/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-turquoise-light backdrop-blur-md">
          Mobile-first mini-sites
        </div>
        <h1 className="mb-4 font-display text-4xl font-bold leading-tight tracking-tight text-white">
          Your business website,
          <br />
          <span className="bg-gradient-to-r from-brand-purple-light to-brand-turquoise-light bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]">
            premium on every phone.
          </span>
        </h1>
        <p className="max-w-[90%] text-[15px] font-medium leading-relaxed text-zinc-400">
          ALINKS helps Indian salons, clinics, and shops launch a beautiful 5-page site with bookings,
          checkout, and WhatsApp sharing — all from your phone.
        </p>

        <div className="mt-10 flex flex-col gap-4">
          <Link href="/signup" className="w-full">
            <Button
              variant="primary"
              className="h-12 w-full rounded-full border border-white/10 bg-gradient-to-r from-brand-purple-dark to-brand-turquoise-dark text-[15px] font-semibold text-white shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all hover:from-brand-purple hover:to-brand-turquoise"
            >
              Start 14-day Pro trial
            </Button>
          </Link>
          <Link href="/demo" className="w-full">
            <Button
              variant="ghost"
              className="h-12 w-full rounded-full border border-white/15 text-[15px] font-medium text-white hover:bg-white/10 hover:text-brand-turquoise-light"
            >
              View demo store
            </Button>
          </Link>
        </div>

        <div className="relative mx-auto mt-12 aspect-[4/5] w-full max-w-[320px] overflow-hidden rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5">
          <div
            className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-tr from-brand-purple/20 to-transparent"
            aria-hidden
          />
          <Image
            src="/assets/marketing/hero-dark.webp"
            alt="ALINKS mobile mini-site preview on phone"
            fill
            className="object-cover"
            priority
            sizes="320px"
          />
        </div>

        <dl className="mt-12 grid grid-cols-3 gap-3">
          {highlights.map((h) => (
            <div
              key={h.label}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4 text-center shadow-lg backdrop-blur-md"
            >
              <dt className="mb-1 text-[9px] font-medium uppercase tracking-wider text-brand-turquoise-light/80">
                {h.label}
              </dt>
              <dd className="font-display text-lg font-bold text-white drop-shadow-md">{h.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
