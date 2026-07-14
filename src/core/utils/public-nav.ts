import type { BusinessVertical } from "@/core/types/tenant";

export type PublicNavItem = {
  key: string;
  label: string;
  href: string;
  /** Short glyph for bottom tab bar */
  icon: "home" | "about" | "services" | "shop" | "book" | "contact";
};

/**
 * Single clear public navigation — never both "Services" and "Shop".
 * Salon/beauty also get a primary Book tab.
 * Legal lives in the footer only (keeps the tab bar to ≤5 items).
 */
export function buildPublicNav(handle: string, vertical: string): PublicNavItem[] {
  const v = vertical as BusinessVertical | string;
  const shopVerticals = new Set(["ecommerce", "kirana", "grocery", "restaurant"]);
  const serviceVerticals = new Set(["salon", "beauty", "clinic", "pharmacy"]);
  const bookVerticals = new Set(["salon", "beauty"]);

  const items: PublicNavItem[] = [
    { key: "home", label: "Home", href: `/${handle}`, icon: "home" },
    { key: "about", label: "About", href: `/${handle}/about`, icon: "about" },
  ];

  if (serviceVerticals.has(v)) {
    items.push({ key: "services", label: "Services", href: `/${handle}/services`, icon: "services" });
    if (bookVerticals.has(v)) {
      items.push({ key: "book", label: "Book", href: `/${handle}/book`, icon: "book" });
    }
  } else if (shopVerticals.has(v)) {
    items.push({ key: "shop", label: "Shop", href: `/${handle}/store`, icon: "shop" });
  } else {
    items.push({ key: "shop", label: "Shop", href: `/${handle}/store`, icon: "shop" });
  }

  items.push({ key: "contact", label: "Contact", href: `/${handle}/contact`, icon: "contact" });

  return items;
}

export function isPublicNavActive(item: PublicNavItem, slug: string, path?: string): boolean {
  if (item.key === "home") return slug === "home" && !path;
  if (item.key === "shop") return path === "store" || slug === "store";
  if (item.key === "book") return path === "book" || slug === "book";
  if (item.key === "contact") return slug === "contact" || path === "checkout";
  return slug === item.key;
}
