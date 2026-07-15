"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/core/utils/cn";
import type { BusinessVertical } from "@/core/types/tenant";

type NavLink = {
  href: string;
  label: string;
  match: (p: string) => boolean;
  /** If set, tab only shows for these verticals. Omit = all verticals. */
  verticals?: readonly BusinessVertical[];
};

const ALL_LINKS: NavLink[] = [
  {
    href: "/editor/business",
    label: "Business",
    match: (p) => p.startsWith("/editor/business"),
  },
  {
    href: "/editor",
    label: "Pages",
    match: (p) => p === "/editor" || p.startsWith("/editor/pages"),
  },
  {
    href: "/editor/theme",
    label: "Theme",
    match: (p) => p.startsWith("/editor/theme"),
  },
  {
    href: "/editor/branding",
    label: "Logo",
    match: (p) => p.startsWith("/editor/branding"),
  },
  {
    href: "/editor/commerce",
    label: "Store",
    match: (p) => p.startsWith("/editor/commerce"),
    // Shop / catalog — not clinic-only medical
    verticals: ["salon", "beauty", "kirana", "grocery", "ecommerce", "restaurant", "pharmacy", "general"],
  },
  {
    href: "/editor/packages",
    label: "Pkgs",
    match: (p) => p.startsWith("/editor/packages"),
    verticals: ["salon", "beauty"],
  },
  {
    href: "/editor/staff",
    label: "Staff",
    match: (p) => p.startsWith("/editor/staff"),
    verticals: ["salon", "beauty", "clinic"],
  },
  {
    href: "/editor/clinic",
    label: "Clinic",
    match: (p) => p.startsWith("/editor/clinic"),
    /** NMC / medical license — clinics only, never salons */
    verticals: ["clinic"],
  },
  {
    href: "/editor/publish",
    label: "Go live",
    match: (p) => p.startsWith("/editor/publish"),
  },
];

export function editorLinksForVertical(vertical: string): NavLink[] {
  const v = vertical as BusinessVertical;
  return ALL_LINKS.filter((l) => !l.verticals || l.verticals.includes(v));
}

/** Horizontal chip nav — phone-width, sticky; tabs depend on business vertical. */
export function EditorNav({
  active,
  vertical = "general",
}: {
  active?: string;
  /** Current business vertical — hides Clinic for salons, etc. */
  vertical?: string;
}) {
  const pathname = usePathname();
  const links = editorLinksForVertical(vertical);

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
