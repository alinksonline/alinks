import Link from "next/link";
import { ThemeAwareLogo } from "@/components/shared/theme-aware-logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-brand-ink/[0.06] bg-brand-surface pb-[calc(2rem+env(safe-area-inset-bottom))] pt-10">
      <div className="app-container">
        <ThemeAwareLogo height={24} />
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-brand-ink/55">
          ALINKS by Artix — India-first mini-website platform for small businesses.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/40">Product</p>
            <ul className="mt-3 space-y-2 text-brand-ink/70">
              <li><Link href="/signup">Sign up</Link></li>
              <li><Link href="/demo">Demo</Link></li>
              <li><Link href="#pricing">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/40">Legal</p>
            <ul className="mt-3 space-y-2 text-brand-ink/70">
              <li><Link href="/terms">Terms</Link></li>
              <li><Link href="/privacy">Privacy</Link></li>
              <li><Link href="/aup">AUP</Link></li>
              <li><Link href="/grievance">Grievance</Link></li>
            </ul>
          </div>
        </div>

        <p className="mt-10 text-center font-mono text-[10px] text-brand-ink/35">
          © {new Date().getFullYear()} Artix
        </p>
      </div>
    </footer>
  );
}