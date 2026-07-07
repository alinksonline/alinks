import Link from "next/link";

const links = [
  { href: "/editor", label: "Pages" },
  { href: "/editor/theme", label: "Theme" },
  { href: "/editor/branding", label: "Brand" },
  { href: "/editor/commerce", label: "Store" },
  { href: "/editor/packages", label: "Packages" },
  { href: "/editor/staff", label: "Staff" },
  { href: "/editor/clinic", label: "Clinic" },
  { href: "/editor/publish", label: "Publish" },
];

export function EditorNav({ active }: { active?: string }) {
  return (
    <nav className="flex gap-1 overflow-x-auto border-b bg-white px-2 py-2 text-sm">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`whitespace-nowrap rounded-lg px-3 py-2 ${
            active === l.href ? "bg-slate-900 font-semibold text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}