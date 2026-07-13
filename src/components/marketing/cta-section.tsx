import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden border-t border-white/5 bg-[#050505] py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-purple/10 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-48 w-[120%] -translate-x-1/2 rounded-t-[100%] bg-brand-turquoise/20 blur-[100px]"
        aria-hidden
      />

      <div className="app-container relative z-10 text-center">
        <div className="mb-4 inline-block rounded-full border border-brand-purple/30 bg-brand-purple/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-purple-light">
          Ready?
        </div>
        <h2 className="mb-4 font-display text-3xl font-bold text-white">Launch your mini-site today</h2>
        <p className="mx-auto mb-8 max-w-xs text-sm leading-relaxed text-zinc-400">
          14-day Pro trial · phone OTP signup · built for mobile
        </p>
        <Link href="/signup" className="block w-full">
          <Button
            variant="primary"
            className="h-14 w-full rounded-full border border-white/10 bg-gradient-to-r from-brand-purple-dark to-brand-turquoise-dark text-[16px] font-bold text-white shadow-[0_0_40px_rgba(45,212,191,0.4)] transition-all hover:from-brand-purple hover:to-brand-turquoise"
          >
            Create your ALINKS site
          </Button>
        </Link>
      </div>
    </section>
  );
}
