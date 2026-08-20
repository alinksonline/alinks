import { isPresenceIndustry, resolveIndustryGroup } from "@/core/config/industries";
import type { BusinessVertical } from "@/core/types/tenant";

export type PublicNavItem = {
  key: string;
  label: string;
  href: string;
  /** Short glyph for bottom tab bar */
  icon: "home" | "about" | "services" | "shop" | "book" | "contact";
};

/**
 * Retail/general shops show Products and Services as separate catalog tabs.
 * Salon/clinic keep CMS Services + Book. Presence/food/RE stay specialized.
 */
export function buildPublicNav(
  handle: string,
  vertical: string,
  industryGroup?: string | null,
  industryType?: string | null,
  catalogMode: "products" | "services" | "both" = "both",
): PublicNavItem[] {
  const v = vertical as BusinessVertical | string;
  const group = resolveIndustryGroup(industryGroup || v);

  if (isPresenceIndustry(v) || group === "presence") {
    return [
      { key: "home", label: "Home", href: `/${handle}`, icon: "home" },
      { key: "services", label: "Links", href: `/${handle}/services`, icon: "services" },
      { key: "about", label: "About", href: `/${handle}/about`, icon: "about" },
      { key: "contact", label: "Contact", href: `/${handle}/contact`, icon: "contact" },
    ];
  }

  if (group === "food" || v === "restaurant") {
    return [
      { key: "home", label: "Home", href: `/${handle}`, icon: "home" },
      { key: "shop", label: "Menu", href: `/${handle}/menu`, icon: "shop" },
      { key: "about", label: "About", href: `/${handle}/about`, icon: "about" },
      { key: "contact", label: "Contact", href: `/${handle}/contact`, icon: "contact" },
    ];
  }

  // Bookings industry + salon: Book tab
  if (group === "bookings" || group === "salon_beauty" || v === "clinic") {
    return [
      { key: "home", label: "Home", href: `/${handle}`, icon: "home" },
      { key: "services", label: "Services", href: `/${handle}/services`, icon: "services" },
      { key: "book", label: "Book", href: `/${handle}/book`, icon: "book" },
      { key: "contact", label: "Contact", href: `/${handle}/contact`, icon: "contact" },
    ];
  }

  // Real estate Property-Bank
  if (group === "real_estate") {
    return [
      { key: "home", label: "Home", href: `/${handle}`, icon: "home" },
      { key: "shop", label: "Listings", href: `/${handle}/listings`, icon: "shop" },
      { key: "about", label: "About", href: `/${handle}/about`, icon: "about" },
      { key: "contact", label: "Contact", href: `/${handle}/contact`, icon: "contact" },
    ];
  }

  // Education — courses catalogue + YouTube
  if (group === "education") {
    return [
      { key: "home", label: "Home", href: `/${handle}`, icon: "home" },
      { key: "services", label: "Courses", href: `/${handle}/courses`, icon: "services" },
      { key: "about", label: "About", href: `/${handle}/about`, icon: "about" },
      { key: "contact", label: "Contact", href: `/${handle}/contact`, icon: "contact" },
    ];
  }

  // Fitness — packages + free trial book
  if (group === "fitness") {
    return [
      { key: "home", label: "Home", href: `/${handle}`, icon: "home" },
      { key: "services", label: "Classes", href: `/${handle}/services`, icon: "services" },
      { key: "book", label: "Book", href: `/${handle}/book`, icon: "book" },
      { key: "contact", label: "Contact", href: `/${handle}/contact`, icon: "contact" },
    ];
  }

  // Automotive — type-aware nav
  if (group === "automotive") {
    const t = industryType ?? "";
    if (t === "spare_parts_shop") {
      return [
        { key: "home", label: "Home", href: `/${handle}`, icon: "home" },
        { key: "shop", label: "Parts", href: `/${handle}/store`, icon: "shop" },
        { key: "about", label: "About", href: `/${handle}/about`, icon: "about" },
        { key: "contact", label: "Contact", href: `/${handle}/contact`, icon: "contact" },
      ];
    }
    if (t === "service_workshop" || t === "car_detailing") {
      return [
        { key: "home", label: "Home", href: `/${handle}`, icon: "home" },
        { key: "services", label: "Services", href: `/${handle}/services`, icon: "services" },
        { key: "book", label: "Book", href: `/${handle}/book`, icon: "book" },
        { key: "contact", label: "Contact", href: `/${handle}/contact`, icon: "contact" },
      ];
    }
    // Dealers
    return [
      { key: "home", label: "Home", href: `/${handle}`, icon: "home" },
      { key: "shop", label: "Vehicles", href: `/${handle}/vehicles`, icon: "shop" },
      { key: "about", label: "About", href: `/${handle}/about`, icon: "about" },
      { key: "contact", label: "Contact", href: `/${handle}/contact`, icon: "contact" },
    ];
  }

  const shopVerticals = new Set(["ecommerce", "kirana", "grocery"]);
  const serviceVerticals = new Set(["salon", "beauty", "pharmacy"]);
  const bookVerticals = new Set(["salon", "beauty"]);

  const items: PublicNavItem[] = [{ key: "home", label: "Home", href: `/${handle}`, icon: "home" }];

  if (serviceVerticals.has(v)) {
    items.push({ key: "services", label: "Services", href: `/${handle}/services`, icon: "services" });
    if (bookVerticals.has(v)) {
      items.push({ key: "book", label: "Book", href: `/${handle}/book`, icon: "book" });
    }
  } else if (shopVerticals.has(v) || group === "retail" || group === "general") {
    if (catalogMode !== "services") {
      items.push({ key: "shop", label: "Products", href: `/${handle}/products`, icon: "shop" });
    }
    if (catalogMode !== "products") {
      items.push({
        key: "services",
        label: "Services",
        href: `/${handle}/service-shop`,
        icon: "services",
      });
    }
  } else {
    items.push({ key: "services", label: "Services", href: `/${handle}/services`, icon: "services" });
  }

  items.push({ key: "contact", label: "Contact", href: `/${handle}/contact`, icon: "contact" });

  return items;
}

export function isPublicNavActive(item: PublicNavItem, slug: string, path?: string): boolean {
  if (item.key === "home") return slug === "home" && !path;
  if (item.key === "shop") {
    return (
      path === "store" ||
      path === "products" ||
      path === "menu" ||
      path === "listings" ||
      path === "vehicles" ||
      slug === "store" ||
      slug === "products" ||
      slug === "menu" ||
      slug === "listings" ||
      slug === "vehicles"
    );
  }
  if (item.key === "services" && (path === "courses" || slug === "courses" || path === "service-shop")) {
    return true;
  }
  if (item.key === "book") return path === "book" || slug === "book";
  if (item.key === "contact") return slug === "contact" || path === "checkout";
  return slug === item.key;
}
