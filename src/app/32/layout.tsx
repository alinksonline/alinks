import type { ReactNode } from "react";
import Link from "next/link";
import { AlinksLogo } from "@/components/shared/alinks-logo";

/**
 * Unlisted technical docs under /32/doc/* (not linked from marketing).
 * “32” is an arbitrary non-obvious prefix — not security, just low public discovery.
 */
export default function UnlistedDocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#050505] text-zinc-200">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="shrink-0" aria-label="ALINKS">
            <AlinksLogo height={28} variant="dark" />
          </Link>
          <span className="font-mono text-[10px] text-zinc-600">ref docs</span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10">{children}</main>
      <footer className="border-t border-white/10 py-8 text-center text-[11px] text-zinc-600">
        ALINKS · technical reference
      </footer>
    </div>
  );
}
