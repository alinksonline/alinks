"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/core/utils/cn";

const links = [
  { href: "/editor/business", label: "Business", match: (p: string) => p.startsWith("/editor/business") },
  { href: "/editor", label: "Pages", match: (p: string) => p === "/editor" || p.startsWith("/editor/pages") },
  { href: "/editor/theme", label: "Theme", match: (p: string) => p.startsWith("/editor/theme") },
  { href: "/editor/branding", label: "Logo", match: (p: string) => p.startsWith("/editor/branding") },
  { href: "/editor/commerce", label: "Store", match: (p: string) => p.startsWith("/editor/commerce") },
  { href: "/editor/packages", label: "Pkgs", match: (p: string) => p.startsWith("/editor/packages") },
  { href: "/editor/staff", label: "Staff", match: (p: string) => p.startsWith("/editor/staff") },
  { href: "/editor/clinic", label: "Clinic", match: (p: string) => p.startsWith("/editor/clinic") },
  { href: "/editor/publish", label: "Go live", match: (p: string) => p.startsWith("/editor/publish") },
];

/** Horizontal chip nav — phone-width, sticky, scroll-snap for thumb use. */
export function EditorNav({ active }: { active?: string }) {
  const pathname = usePathname();

  return (
    <nav
      className="editor-subnav sticky top-0 z-30 border-b border-brand-ink/8 bg-brand-surface/95 backdrop-blur-md"
      aria-label="Website builder"
    >
      <div className="editor-subnav-scroll flex gap-1 overflow-x-auto overscroll-x-contain px-2.5 py-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {links.map((l) => {
          const isActive = active ? active === l.href : l.match(pathname);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "snap-start whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold transition active:scale-[0.98]",
                isActive
                  ? "bg-brand-ink text-brand-cream shadow-soft dark:bg-brand-ink dark:text-brand-cream"
                  : "bg-brand-mist text-brand-muted active:bg-brand-ink/10",
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
