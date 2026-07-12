import Link from "next/link";
import { buildPublicNav, isPublicNavActive } from "@/core/utils/public-nav";

/** Compact themed page chips — one Shop OR Services entry, never both. */
export function PublicSiteNav({
  handle,
  vertical,
  slug,
  path,
}: {
  handle: string;
  vertical: string;
  slug: string;
  /** Extra path segment e.g. "store" */
  path?: string;
}) {
  const items = buildPublicNav(handle, vertical);

  return (
    <nav className="mt-7 flex flex-wrap justify-center gap-1.5" aria-label="Site pages">
      {items.map((item) => {
        const active = isPublicNavActive(item, slug, path);
        return (
          <Link
            key={item.key}
            href={item.href}
            className={active ? "t-chip t-chip-active" : "t-chip"}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
