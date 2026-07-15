import type { Metadata } from "next";
import Image from "next/image";
import { AlinksLogo } from "@/components/shared/alinks-logo";

export const metadata: Metadata = {
  title: "ALINKS — Coming soon",
  description: "Something new is coming. Stay tuned.",
  robots: { index: false, follow: false },
};

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
          className="object-cover object-center opacity-75"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030308]/50 via-[#030308]/80 to-[#030308]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(139,92,246,0.4),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_90%_100%,rgba(45,212,191,0.2),transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.55) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
            maskImage: "radial-gradient(ellipse at center, black 15%, transparent 72%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col px-5 pb-8 pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-8">
        <header className="flex items-center justify-between gap-3">
          <AlinksLogo height={32} variant="dark" priority />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 backdrop-blur-md">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-turquoise-light opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-turquoise-light" />
            </span>
            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-300">
              Soon
            </span>
          </span>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center py-16 text-center">
          <div className="mb-8 inline-flex rounded-full border border-brand-purple/40 bg-brand-purple/15 px-4 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-purple-light shadow-[0_0_28px_rgba(139,92,246,0.3)]">
            Coming soon
          </div>

          <h1 className="font-display text-[2.35rem] font-bold leading-[1.05] tracking-tight sm:text-5xl">
            Something
            <br />
            <span className="bg-gradient-to-r from-brand-purple-light via-white to-brand-turquoise-light bg-clip-text text-transparent">
              extraordinary
            </span>
            <br />
            is on the way.
          </h1>

          <p className="mx-auto mt-6 max-w-sm text-[15px] leading-relaxed text-zinc-400">
            We&apos;re putting the finishing touches on ALINKS.
            <br />
            The reveal is almost here.
          </p>

          {/* Decorative pulse ring */}
          <div className="relative mt-14 flex h-28 w-28 items-center justify-center" aria-hidden>
            <span className="absolute inset-0 animate-ping rounded-full border border-brand-turquoise/30 opacity-40" />
            <span className="absolute inset-3 rounded-full border border-brand-purple/25" />
            <span className="absolute inset-6 rounded-full bg-gradient-to-br from-brand-purple/30 to-brand-turquoise/25 blur-sm" />
            <span className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-turquoise shadow-[0_0_40px_rgba(45,212,191,0.45)]" />
          </div>
        </main>

        <footer className="mt-auto border-t border-white/10 pt-6">
          <div className="flex flex-col items-center gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              A unit of
            </p>
            <Image
              src="/assets/artix-logo.png"
              alt="Artix — Branding, Creative, Designs"
              width={200}
              height={81}
              className="h-auto w-[180px] max-w-[70vw] object-contain sm:w-[200px]"
              priority
            />
          </div>
        </footer>
      </div>
    </div>
  );
}
