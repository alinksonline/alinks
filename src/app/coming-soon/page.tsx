import type { Metadata } from "next";
import { headers } from "next/headers";
import { AlinksLogo } from "@/components/shared/alinks-logo";
import { getClientIp } from "@/platform/coming-soon/gate";

export const metadata: Metadata = {
  title: "ALINKS — Coming soon",
  description: "India-first mini websites for salons, clinics, and shops. Launching soon.",
  robots: { index: false, follow: false },
};

export default function ComingSoonPage() {
  const ip = getClientIp(headers()) ?? "unknown";

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#050505] px-6 py-16 text-center text-white">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-full max-w-lg -translate-x-1/2 rounded-full bg-brand-purple/25 opacity-70 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-brand-turquoise/15 blur-[90px]"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="mx-auto mb-8 flex justify-center">
          <AlinksLogo height={36} variant="dark" priority />
        </div>

        <div className="mb-5 inline-flex rounded-full border border-brand-turquoise/30 bg-brand-turquoise/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-turquoise-light">
          Coming soon
        </div>

        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Mini websites for Indian businesses
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-zinc-400">
          ALINKS is almost ready — 5-page sites, UPI, COD, WhatsApp, and bookings built for salons,
          clinics, and kiranas. We&apos;re putting the final polish on before public launch.
        </p>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left backdrop-blur-md">
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">What&apos;s coming</p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
            <li>· Mobile-first 5-page mini sites</li>
            <li>· Salon packages & clinic slots</li>
            <li>· Kirana catalog · UPI · COD</li>
            <li>· Tap & Blast on WhatsApp</li>
          </ul>
        </div>

        <p className="mt-10 font-mono text-[10px] text-zinc-600">
          Access limited · ref {ip}
        </p>
      </div>
    </div>
  );
}
