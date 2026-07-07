import type { Business } from "@/core/types/tenant";

export function SiteHeader({ business }: { business: Business }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <span className="font-bold text-slate-900">{business.name}</span>
        <span className="text-xs uppercase tracking-wide text-slate-400">{business.vertical}</span>
      </div>
    </header>
  );
}