"use client";

import Link from "next/link";
import { AlinksLogo } from "@/components/shared/alinks-logo";
import { useTheme } from "@/components/shared/theme-provider";
import { useEffect, useState } from "react";

export function MarketingFooter() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <footer className="border-t border-brand-ink/10 dark:border-white/10 bg-brand-cream dark:bg-[#08080c] pb-[calc(2rem+env(safe-area-inset-bottom))] pt-10 transition-colors">
      <div className="app-container">
        <AlinksLogo height={24} variant={isDark ? "dark" : "light"} />
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-stone-500 dark:text-zinc-400">
          ALINKS by Artix — India-first mini-website platform for small businesses.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-stone-500 dark:text-zinc-500">Product</p>
            <ul className="mt-3 space-y-2 text-stone-600 dark:text-zinc-300">
              <li>
                <Link href="/signup" className="transition-colors hover:text-brand-turquoise dark:hover:text-brand-turquoise-light">
                  Sign up
                </Link>
              </li>
              <li>
                <Link href="/demo" className="transition-colors hover:text-brand-turquoise dark:hover:text-brand-turquoise-light">
                  Demo
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="transition-colors hover:text-brand-turquoise dark:hover:text-brand-turquoise-light">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-stone-500 dark:text-zinc-500">Legal</p>
            <ul className="mt-3 space-y-2 text-stone-600 dark:text-zinc-300">
              <li>
                <Link href="/terms" className="transition-colors hover:text-brand-turquoise dark:hover:text-brand-turquoise-light">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition-colors hover:text-brand-turquoise dark:hover:text-brand-turquoise-light">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/aup" className="transition-colors hover:text-brand-turquoise dark:hover:text-brand-turquoise-light">
                  AUP
                </Link>
              </li>
              <li>
                <Link href="/grievance" className="transition-colors hover:text-brand-turquoise dark:hover:text-brand-turquoise-light">
                  Grievance
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="transition-colors hover:text-brand-turquoise dark:hover:text-brand-turquoise-light">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-10 text-center font-mono text-[10px] text-stone-400 dark:text-zinc-600">
          © {new Date().getFullYear()} Artix
        </p>
      </div>
    </footer>
  );
}
