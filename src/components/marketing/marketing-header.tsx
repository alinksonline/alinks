import Link from "next/link";
import { AlinksLogo } from "@/components/shared/alinks-logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";

/**
 * Marketing chrome is always dark (premium landing). Use the dark-background
 * logo regardless of the user's global theme preference.
 */
export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050505]/85 backdrop-blur-md supports-[backdrop-filter]:bg-[#050505]/75">
      <div className="app-container flex h-14 items-center justify-between gap-2">
        <Link href="/" className="shrink-0" aria-label="ALINKS home">
          <AlinksLogo height={26} priority variant="dark" />
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle className="!h-8 !w-8 !rounded-full border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white" />
          <Link
            href="/login"
            className="px-2 py-1 text-sm font-medium text-white/70 transition-colors hover:text-brand-turquoise-light"
          >
            Login
          </Link>
          <Link href="/signup" className="shrink-0">
            <Button
              variant="primary"
              className="!h-8 !w-auto rounded-full border-0 bg-brand-turquoise px-4 text-xs font-semibold text-[#050505] hover:bg-brand-turquoise-light"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
