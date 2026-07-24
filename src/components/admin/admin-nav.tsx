"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/superadmin", label: "Overview" },
  { href: "/superadmin/plan", label: "Full plan" },
  { href: "/superadmin/industries", label: "Industries" },
  { href: "/superadmin/tenants", label: "Tenants" },
  { href: "/superadmin/businesses", label: "Businesses" },
  { href: "/superadmin/compliance", label: "Compliance" },
  { href: "/superadmin/system", label: "System" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between">
          <Link href="/superadmin" className="text-sm font-bold text-white">
            ALINKS Superadmin
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-xs text-slate-400 hover:text-white">
              Logout
            </button>
          </form>
        </div>
        <nav className="-mb-px flex gap-1 overflow-x-auto pb-0 text-sm">
          {LINKS.map((l) => {
            const active = pathname === l.href || (l.href !== "/superadmin" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`whitespace-nowrap border-b-2 px-3 py-2 ${
                  active ? "border-sky-400 text-white" : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}