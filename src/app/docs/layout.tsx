import type { ReactNode } from "react";
import Link from "next/link";
import { AlinksLogo } from "@/components/shared/alinks-logo";

/** Public technical docs — no app chrome, no coming-soon body chrome. */
export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#050505] text-zinc-200">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="shrink-0">
            <AlinksLogo height={28} variant="dark" />
          </Link>
          <nav className="flex gap-4 text-xs font-semibold text-zinc-400">
            <Link href="/docs/supabase" className="hover:text-white">
              Supabase
            </Link>
            <Link href="https://alinks.online" className="hover:text-white">
              alinks.online
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10">{children}</main>
      <footer className="border-t border-white/10 py-8 text-center text-[11px] text-zinc-600">
        ALINKS by Artix · Integration documentation
      </footer>
    </div>
  );
}
