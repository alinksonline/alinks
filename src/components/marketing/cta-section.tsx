import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="bg-black py-24 relative overflow-hidden border-t border-white/5">
      {/* Decorative background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full max-w-[600px] h-[300px] bg-brand-purple/20 blur-[120px] rounded-full" />
      </div>

      <div className="app-container text-center relative z-10 glass-panel rounded-[3rem] p-12 md:p-20 border border-white/10 shadow-[0_0_50px_rgba(124,58,237,0.1)]">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-turquoise mb-4">Ready?</p>
        <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">Launch your mini-site today</h2>
        <p className="text-lg md:text-xl text-white/60 mx-auto max-w-lg mb-10">
          14-day Pro trial · Phone OTP signup · Built for mobile
        </p>
        
        <Link href="/signup" className="inline-block group relative">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-brand-turquoise to-brand-purple opacity-70 blur transition duration-500 group-hover:opacity-100 group-hover:duration-200" />
          <Button variant="primary" className="relative h-14 px-8 rounded-full bg-black text-white hover:bg-black/80 font-bold text-lg border border-white/10 transition-all">
            Create your ALINKS site
          </Button>
        </Link>
      </div>
    </section>
  );
}