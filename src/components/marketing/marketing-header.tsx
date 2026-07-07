import Link from "next/link";
import { AlinksLogo } from "@/components/shared/alinks-logo";
import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-tech-border bg-tech-bg/90 backdrop-blur-md">
      <div className="marketing-container flex h-14 items-center justify-between gap-3 sm:h-16">
        <Link href="/" className="shrink-0">
          <AlinksLogo height={28} variant="dark" priority />
        </Link>
        <nav className="flex min-w-0 items-center gap-2 sm:gap-4">
          <Link
            href="#pricing"
            className="hidden font-mono text-xs text-zinc-500 transition hover:text-tech-cyan md:inline"
          >
            pricing
          </Link>
          <Link href="/demo" className="hidden font-mono text-xs text-zinc-500 transition hover:text-tech-cyan sm:inline">
            /demo
          </Link>
          <Link href="/login" className="font-mono text-xs text-zinc-400 transition hover:text-white">
            login
          </Link>
          <Link href="/signup" className="shrink-0">
            <Button className="whitespace-nowrap border border-tech-cyan/30 bg-tech-cyan/10 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-tech-cyan hover:bg-tech-cyan/20 sm:px-4 sm:text-[11px]">
              Trial
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}