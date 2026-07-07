"use client";

import { cn } from "@/core/utils/cn";
import type { ThemeMode } from "@/core/theme/theme";
import { useTheme } from "./theme-provider";

const options: { value: ThemeMode; label: string; desc: string }[] = [
  { value: "light", label: "Light", desc: "Cream surfaces, ink text" },
  { value: "dark", label: "Dark", desc: "Deep purple night mode" },
  { value: "system", label: "System", desc: "Match your phone setting" },
];

export function ThemeSettings() {
  const { mode, setMode } = useTheme();

  return (
    <div className="grid gap-2">
      {options.map((opt) => {
        const active = mode === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setMode(opt.value)}
            className={cn(
              "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition active:scale-[0.99]",
              active
                ? "border-brand-purple/40 bg-brand-purple/10"
                : "border-brand-ink/10 bg-brand-surface",
            )}
          >
            <span>
              <span className="block text-sm font-semibold text-brand-ink">{opt.label}</span>
              <span className="block text-xs text-brand-ink/55">{opt.desc}</span>
            </span>
            <span
              className={cn(
                "h-4 w-4 shrink-0 rounded-full border-2",
                active ? "border-brand-purple bg-brand-purple" : "border-brand-ink/25",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}