"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/core/utils/cn";
import {
  canShowClinicEditor,
  canShowCommerceEditor,
  canShowFoodMenu,
  canShowPackagesEditor,
  canShowEducationCourses,
  canShowPropertyBank,
  canShowRetailStore,
  canShowStaffEditor,
  canShowVehicleListings,
  type IndustryGateInput,
} from "@/core/utils/industry-gates";

type NavLink = {
  href: string;
  label: string;
  match: (p: string) => boolean;
  /** When set, tab only shows if predicate passes. */
  show?: (gate: IndustryGateInput) => boolean;
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
    href: "/editor/menu",
    label: "Menu",
    match: (p) => p.startsWith("/editor/menu"),
    /** Food Layer 1 digital menu */
    show: (g) => canShowFoodMenu(g),
  },
  {
    href: "/editor/products",
    label: "Products",
    match: (p) => p.startsWith("/editor/products"),
    /** Retail storefront catalog */
    show: (g) => canShowRetailStore(g),
  },
  {
    href: "/editor/listings",
    label: "Listings",
    match: (p) => p.startsWith("/editor/listings"),
    /** RE Property-Bank */
    show: (g) => canShowPropertyBank(g),
  },
  {
    href: "/editor/courses",
    label: "Courses",
    match: (p) => p.startsWith("/editor/courses"),
    /** Education catalogue */
    show: (g) => canShowEducationCourses(g),
  },
  {
    href: "/editor/vehicles",
    label: "Vehicles",
    match: (p) => p.startsWith("/editor/vehicles"),
    /** Automotive inventory */
    show: (g) => canShowVehicleListings(g),
  },
  {
    href: "/editor/commerce",
    label: "Checkout",
    match: (p) => p.startsWith("/editor/commerce"),
    /**
     * TENANT surface: how *end-customers* pay the shop (UPI/COD/sheet).
     * NOT platform subscription — that is /billing (“Plan”).
     * Hidden for Presence (no sales). Food Layer 1 is WhatsApp-first.
     */
    show: (g) => canShowCommerceEditor(g) && !canShowFoodMenu(g),
  },
  {
    href: "/editor/packages",
    label: "Packages",
    match: (p) => p.startsWith("/editor/packages"),
    /** Salon sellable catalog (pay-then-book) — never Presence */
    show: (g) => canShowPackagesEditor(g),
  },
  {
    href: "/editor/staff",
    label: "Staff",
    match: (p) => p.startsWith("/editor/staff"),
    show: (g) => canShowStaffEditor(g),
  },
  {
    href: "/editor/clinic",
    label: "Clinic",
    match: (p) => p.startsWith("/editor/clinic"),
    show: (g) => canShowClinicEditor(g),
  },
  {
    href: "/editor/publish",
    label: "Go live",
    match: (p) => p.startsWith("/editor/publish"),
  },
];

export function editorLinksForVertical(
  vertical: string,
  industryGroup?: string | null,
): NavLink[] {
  const gate: IndustryGateInput = { vertical, industryGroup };
  return ALL_LINKS.filter((l) => !l.show || l.show(gate));
}

/** Horizontal chip nav — phone-width, sticky; tabs depend on industry. */
export function EditorNav({
  active,
  vertical = "general",
  industryGroup,
}: {
  active?: string;
  /** Current business vertical — hides Clinic for salons, commerce for Presence, etc. */
  vertical?: string;
  industryGroup?: string | null;
}) {
  const pathname = usePathname();
  const links = editorLinksForVertical(vertical, industryGroup);

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
