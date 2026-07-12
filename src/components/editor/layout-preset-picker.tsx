"use client";

import type { LayoutPresetId } from "@/core/types/layout-preset";
import { LAYOUT_PRESETS, DEFAULT_LAYOUT } from "@/core/types/layout-preset";
import { cn } from "@/core/utils/cn";

/** Five fixed layouts — Pulse · Orbit · Snap · Frame · Bloom */
export function LayoutPresetPicker({
  value,
  onChange,
}: {
  value?: LayoutPresetId;
  onChange: (id: LayoutPresetId) => void;
}) {
  const current = value ?? DEFAULT_LAYOUT;

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">Layout</p>
      <div className="grid grid-cols-1 gap-1.5">
        {LAYOUT_PRESETS.map((p) => {
          const active = current === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(p.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition active:scale-[0.99]",
                active
                  ? "border-brand-purple/40 bg-brand-purple/10"
                  : "border-brand-ink/10 bg-brand-surface",
              )}
            >
              <LayoutThumb id={p.id} active={active} />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-brand-ink">{p.name}</span>
                <span className="block text-[10px] text-brand-muted">{p.tagline}</span>
              </span>
              {active && (
                <span className="text-[10px] font-bold uppercase tracking-wide text-brand-purple">
                  On
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Tiny abstract preview of each layout geometry */
function LayoutThumb({ id, active }: { id: LayoutPresetId; active: boolean }) {
  const bar = active ? "bg-brand-purple" : "bg-brand-ink/25";
  const shell = cn(
    "relative flex h-10 w-12 shrink-0 flex-col justify-end overflow-hidden rounded-md border",
    active ? "border-brand-purple/40 bg-brand-mist" : "border-brand-ink/10 bg-brand-mist/50",
  );

  if (id === "orbit") {
    return (
      <div className={cn(shell, "items-center justify-center gap-0.5 p-1.5")}>
        <div className={cn("h-1 w-6 rounded-full", bar)} />
        <div className={cn("h-0.5 w-4 rounded-full opacity-60", bar)} />
      </div>
    );
  }
  if (id === "snap") {
    return (
      <div className={cn(shell, "gap-0.5 p-1")}>
        <div className={cn("h-0.5 w-full rounded-full", bar)} />
        <div className={cn("h-0.5 w-3/4 rounded-full opacity-70", bar)} />
      </div>
    );
  }
  if (id === "frame") {
    return (
      <div className={cn(shell, "items-center justify-center p-1")}>
        <div className={cn("flex h-full w-[70%] flex-col justify-end gap-0.5 rounded-sm border p-0.5", active ? "border-brand-purple/50" : "border-brand-ink/20")}>
          <div className={cn("h-0.5 w-full rounded-full", bar)} />
          <div className={cn("h-0.5 w-2/3 rounded-full opacity-60", bar)} />
        </div>
      </div>
    );
  }
  if (id === "bloom") {
    return (
      <div className={cn(shell, "gap-1 p-1.5")}>
        <div className="flex-1" />
        <div className={cn("h-1 w-full rounded-full", bar)} />
        <div className={cn("h-0.5 w-4/5 rounded-full opacity-60", bar)} />
        <div className="h-1" />
      </div>
    );
  }
  // pulse
  return (
    <div className={cn(shell, "gap-0.5 p-1.5")}>
      <div className={cn("h-1 w-full rounded-full", bar)} />
      <div className={cn("h-0.5 w-4/5 rounded-full opacity-60", bar)} />
      <div className={cn("mt-0.5 h-1.5 w-full rounded-sm opacity-80", bar)} />
    </div>
  );
}
