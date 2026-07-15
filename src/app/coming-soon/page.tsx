import type { Metadata } from "next";
import Image from "next/image";
import { AlinksLogo } from "@/components/shared/alinks-logo";

export const metadata: Metadata = {
  title: "ALINKS — Coming soon",
  description: "India-first mini websites for salons, clinics, and shops. Launching soon.",
  robots: { index: false, follow: false },
};

const features = [
  {
    title: "5-page mini sites",
    desc: "Home, about, services, shop & contact — built for phones.",
    icon: "◆",
  },
  {
    title: "UPI · COD · WhatsApp",
    desc: "Checkout and ordering the way India actually pays.",
    icon: "◇",
  },
  {
    title: "Bookings & packages",
    desc: "Salon pay-then-book and clinic slots that land in your sheet.",
    icon: "○",
  },
  {
    title: "Tap & Blast + AI",
    desc: "Share products, packages, and captions in one tap.",
    icon: "✦",
  },
];

export default function ComingSoonPage() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#030308] text-white">
      {/* Background art */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src="/assets/marketing/coming-soon-bg.webp"
          alt=""
          fill
          priority
          className="object-cover object-center opacity-70"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030308]/40 via-[#030308]/75 to-[#030308]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(139,92,246,0.35),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(45,212,191,0.18),transparent_50%)]" />
        {/* Fine grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col px-5 pb-8 pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-8">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-3">
          <AlinksLogo height={30} variant="dark" priority />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 backdrop-blur-md">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-turquoise-light opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-turquoise-light" />
            </span>
            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-300">
              Launching soon
            </span>
          </span>
        </header>

        {/* Hero */}
        <main className="flex flex-1 flex-col justify-center py-10">
          <div className="mb-6 inline-flex w-fit rounded-full border border-brand-purple/40 bg-brand-purple/15 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-purple-light shadow-[0_0_24px_rgba(139,92,246,0.25)]">
            India-first · Mobile-first
          </div>

          <h1 className="font-display text-[2.15rem] font-bold leading-[1.08] tracking-tight sm:text-5xl">
            Your business,
            <br />
            <span className="bg-gradient-to-r from-brand-purple-light via-white to-brand-turquoise-light bg-clip-text text-transparent">
              premium on every phone.
            </span>
          </h1>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-zinc-400">
            ALINKS is the mini-website platform for Indian salons, clinics, and kiranas —
            bookings, UPI, COD, WhatsApp blast, and AI captions. We&apos;re finishing the
            polish before public launch.
          </p>

          {/* Feature grid */}
          <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:border-brand-turquoise/30 hover:bg-white/[0.07]"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-brand-purple/40 to-brand-turquoise/30 text-sm text-white shadow-inner"
                    aria-hidden
                  >
                    {f.icon}
                  </span>
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-bold tracking-tight text-white">{f.title}</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Highlight strip */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-brand-purple/20 via-white/[0.04] to-brand-turquoise/15 p-[1px]">
            <div className="rounded-[15px] bg-[#0a0a12]/80 px-5 py-4 backdrop-blur-xl">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-turquoise-light">
                Built for owners who work on their phone
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                14-day Pro trial · no card required · founders lock for early adopters.
              </p>
            </div>
          </div>
        </main>

        {/* Footer — Artix unit */}
        <footer className="mt-auto border-t border-white/10 pt-6">
          <div className="flex flex-col items-center gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              A unit of
            </p>
            <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-md">
              <Image
                src="/favicon.png"
                alt="Artix"
                width={28}
                height={28}
                className="h-7 w-7 rounded-lg object-cover ring-1 ring-white/15"
              />
              <span className="font-display text-base font-bold tracking-[0.12em] text-white">
                ARTIX
              </span>
            </div>
            <p className="max-w-xs text-center text-[11px] leading-relaxed text-zinc-500">
              ALINKS is a product of Artix — building tools for Indian small businesses.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
