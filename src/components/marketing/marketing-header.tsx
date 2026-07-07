import Link from "next/link";
import { ThemeAwareLogo } from "@/components/shared/theme-aware-logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-ink/[0.06] bg-brand-cream/90 backdrop-blur-md supports-[backdrop-filter]:bg-brand-cream/80">
      <div className="app-container flex h-14 items-center justify-between gap-2">
        <Link href="/" className="shrink-0">
          <ThemeAwareLogo height={26} priority />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className="px-2 py-1 text-sm font-medium text-brand-ink/70">
            Login
          </Link>
          <Link href="/signup" className="shrink-0">
            <Button variant="bronze" className="!w-auto !px-4 !py-2 text-xs">
              Start free
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}