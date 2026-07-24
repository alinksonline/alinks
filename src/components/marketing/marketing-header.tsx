"use client";

import Link from "next/link";
import { AlinksLogo } from "@/components/shared/alinks-logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/shared/theme-provider";
import { useEffect, useState } from "react";

export function MarketingHeader() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <header className="sticky top-0 z-50 border-b border-brand-ink/10 dark:border-white/10 bg-brand-surface/85 dark:bg-[#050505]/85 backdrop-blur-md supports-[backdrop-filter]:bg-brand-surface/75 dark:supports-[backdrop-filter]:bg-[#050505]/75 transition-colors">
      <div className="app-container flex h-14 items-center justify-between gap-2">
        <Link href="/" className="shrink-0" aria-label="ALINKS home">
          <AlinksLogo height={26} priority variant={isDark ? "dark" : "light"} />
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle className="!h-8 !w-8 !rounded-full border-brand-ink/10 dark:border-white/10 bg-white/50 dark:bg-white/5 text-brand-ink/70 dark:text-white/70 hover:bg-white/80 dark:hover:bg-white/10 hover:text-brand-ink dark:hover:text-white" />
          <Link
            href="/login"
            className="px-2 py-1 text-sm font-medium text-stone-600 dark:text-white/70 transition-colors hover:text-brand-turquoise dark:hover:text-brand-turquoise-light"
          >
            Login
          </Link>
          <Link href="/signup" className="shrink-0">
            <Button
              variant="primary"
              className="!h-8 !w-auto rounded-full border-0 bg-brand-turquoise px-4 text-xs font-semibold text-white dark:text-[#050505] hover:bg-brand-turquoise-dark dark:hover:bg-brand-turquoise-light"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
