import type { BusinessVertical } from "@/core/types/tenant";

export type PublicNavItem = {
  key: string;
  label: string;
  href: string;
};

/**
 * Single clear public navigation — never both "Services" and "Store".
 * - Shop verticals → one Shop entry (product catalog)
 * - Service verticals → one Services entry (services page stack)
 * - General → Shop (catalog) as the buy/order path
 */
export function buildPublicNav(handle: string, vertical: string): PublicNavItem[] {
  const v = vertical as BusinessVertical | string;
  const shopVerticals = new Set(["ecommerce", "kirana", "grocery", "restaurant"]);
  const serviceVerticals = new Set(["salon", "beauty", "clinic", "pharmacy"]);

  const items: PublicNavItem[] = [
    { key: "home", label: "Home", href: `/${handle}` },
    { key: "about", label: "About", href: `/${handle}/about` },
  ];

  if (serviceVerticals.has(v)) {
    items.push({ key: "services", label: "Services", href: `/${handle}/services` });
  } else if (shopVerticals.has(v)) {
    items.push({ key: "shop", label: "Shop", href: `/${handle}/store` });
  } else {
    // general / other — one order path
    items.push({ key: "shop", label: "Shop", href: `/${handle}/store` });
  }

  items.push(
    { key: "contact", label: "Contact", href: `/${handle}/contact` },
    { key: "legal", label: "Legal", href: `/${handle}/legal` },
  );

  return items;
}

export function isPublicNavActive(item: PublicNavItem, slug: string, path?: string): boolean {
  if (item.key === "home") return slug === "home" && path !== "store";
  if (item.key === "shop") return path === "store" || slug === "store";
  return slug === item.key;
}
