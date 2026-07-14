import Link from "next/link";
import { buildPublicNav, isPublicNavActive, type PublicNavItem } from "@/core/utils/public-nav";

function NavIcon({ icon, active }: { icon: PublicNavItem["icon"]; active: boolean }) {
  const stroke = active ? "currentColor" : "currentColor";
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true as const,
  };

  switch (icon) {
    case "home":
      return (
        <svg {...common}>
          <path
            d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
            stroke={stroke}
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "about":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.25" stroke={stroke} strokeWidth="1.75" />
          <path
            d="M5.5 19.5c1.2-3.2 3.5-4.75 6.5-4.75s5.3 1.55 6.5 4.75"
            stroke={stroke}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );
    case "services":
      return (
        <svg {...common}>
          <path
            d="M8 7h8M8 12h8M8 17h5"
            stroke={stroke}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <rect x="4" y="4" width="16" height="16" rx="3" stroke={stroke} strokeWidth="1.75" />
        </svg>
      );
    case "shop":
      return (
        <svg {...common}>
          <path
            d="M5 8h14l-1.2 10.2A2 2 0 0 1 15.81 20H8.19a2 2 0 0 1-1.99-1.8L5 8Z"
            stroke={stroke}
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path d="M9 8V6.5A3 3 0 0 1 12 3.5v0A3 3 0 0 1 15 6.5V8" stroke={stroke} strokeWidth="1.75" />
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="15" rx="2.5" stroke={stroke} strokeWidth="1.75" />
          <path d="M8 3.5v4M16 3.5v4M4 10.5h16" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case "contact":
      return (
        <svg {...common}>
          <path
            d="M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v6A2.5 2.5 0 0 1 16.5 16H10l-4 3v-3H7.5A2.5 2.5 0 0 1 5 13.5v-6Z"
            stroke={stroke}
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

/** Sticky bottom tab bar — mobile-app navigation for tenant mini-sites. */
export function PublicSiteNav({
  handle,
  vertical,
  slug,
  path,
}: {
  handle: string;
  vertical: string;
  slug: string;
  /** Extra path segment e.g. "store" | "book" | "checkout" */
  path?: string;
}) {
  const items = buildPublicNav(handle, vertical);

  return (
    <nav className="t-bottom-nav" aria-label="Site pages">
      {items.map((item) => {
        const active = isPublicNavActive(item, slug, path);
        return (
          <Link key={item.key} href={item.href} data-active={active ? "true" : "false"}>
            <NavIcon icon={item.icon} active={active} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
