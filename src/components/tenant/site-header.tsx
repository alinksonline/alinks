import type { Business } from "@/core/types/tenant";

export function SiteHeader({ business }: { business: Business }) {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-ink/[0.06] bg-brand-surface/95 backdrop-blur-md">
      <div className="app-container flex h-14 items-center justify-between gap-2">
        <span className="truncate font-display text-base font-bold text-brand-ink">{business.name}</span>
        <span className="shrink-0 rounded-full bg-brand-purple/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-brand-purple">
          {business.vertical}
        </span>
      </div>
    </header>
  );
}