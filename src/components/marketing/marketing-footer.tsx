import Link from "next/link";
import { AlinksLogo } from "@/components/shared/alinks-logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-tech-border bg-tech-panel text-zinc-400">
      <div className="marketing-container flex flex-col gap-10 py-12 sm:gap-12 sm:py-16 md:flex-row md:justify-between">
        <div className="min-w-0">
          <AlinksLogo height={26} variant="dark" />
          <p className="mt-4 max-w-xs font-mono text-xs leading-relaxed">
            ALINKS · Artix platform layer
            <br />
            India-first multi-tenant SMB infrastructure
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 font-mono text-xs sm:flex sm:gap-16">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-600">routes</p>
            <ul className="mt-4 space-y-2">
              <li><Link href="/signup" className="hover:text-tech-cyan">/signup</Link></li>
              <li><Link href="/demo" className="hover:text-tech-cyan">/demo</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-600">legal</p>
            <ul className="mt-4 space-y-2">
              <li><Link href="/terms" className="hover:text-tech-cyan">/terms</Link></li>
              <li><Link href="/privacy" className="hover:text-tech-cyan">/privacy</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-tech-border py-5 text-center font-mono text-[10px] text-zinc-600 sm:py-6">
        © {new Date().getFullYear()} Artix · build 0.1.0
      </div>
    </footer>
  );
}