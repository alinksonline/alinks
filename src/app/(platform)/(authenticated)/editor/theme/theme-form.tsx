"use client";

import { useState, useTransition } from "react";
import { updateThemeAction } from "@/app/actions/business";
import { Button } from "@/components/ui/button";
import type { ThemeConfig } from "@/core/types/page";
import { contrastOn } from "@/core/utils/tenant-theme";

const FONTS = ["Inter", "system", "Serif", "Mono", "Rounded"] as const;
const RADII = [
  { label: "Soft", value: "10px" },
  { label: "Round", value: "14px" },
  { label: "Pill", value: "20px" },
  { label: "Sharp", value: "6px" },
] as const;
const MODES: ThemeConfig["mode"][] = ["light", "dark", "system"];

export function ThemeForm({ businessId, initialTheme }: { businessId: string; initialTheme: ThemeConfig }) {
  const [theme, setTheme] = useState<ThemeConfig>(initialTheme);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const onPrimary = contrastOn(theme.primaryColor);

  return (
    <form
      className="space-y-3 pb-28"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const r = await updateThemeAction(businessId, theme);
          setMessage(r.success ? "Theme applied to your public site" : r.error ?? "Save failed");
        });
      }}
    >
      <p className="text-[11px] leading-snug text-brand-muted">
        These colors, mode, font, and radius apply to your entire public mini-site — header, pages,
        store, and footer.
      </p>

      <label className="ui-row">
        <span className="text-xs font-semibold text-brand-ink">Primary</span>
        <input
          type="color"
          value={theme.primaryColor}
          onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
          className="h-8 w-12 cursor-pointer rounded-md border-0 bg-transparent p-0"
        />
      </label>
      <label className="ui-row">
        <span className="text-xs font-semibold text-brand-ink">Accent</span>
        <input
          type="color"
          value={theme.accentColor}
          onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
          className="h-8 w-12 cursor-pointer rounded-md border-0 bg-transparent p-0"
        />
      </label>

      <div>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-brand-muted">Mode</p>
        <div className="flex gap-1.5">
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setTheme({ ...theme, mode: m })}
              className={`flex-1 rounded-lg border px-2 py-1.5 text-[11px] font-semibold capitalize ${
                theme.mode === m
                  ? "border-brand-purple/40 bg-brand-purple/10 text-brand-ink"
                  : "border-brand-ink/10 bg-brand-surface text-brand-muted"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-brand-muted">Font</p>
        <div className="flex flex-wrap gap-1.5">
          {FONTS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setTheme({ ...theme, fontFamily: f })}
              className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${
                theme.fontFamily === f
                  ? "border-brand-purple/40 bg-brand-purple/10 text-brand-ink"
                  : "border-brand-ink/10 bg-brand-surface text-brand-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-brand-muted">Corners</p>
        <div className="flex flex-wrap gap-1.5">
          {RADII.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setTheme({ ...theme, borderRadius: r.value })}
              className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${
                theme.borderRadius === r.value
                  ? "border-brand-purple/40 bg-brand-purple/10 text-brand-ink"
                  : "border-brand-ink/10 bg-brand-surface text-brand-muted"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live mini preview using tenant tokens */}
      <div
        className="overflow-hidden rounded-xl border border-brand-ink/10 p-3 shadow-card"
        style={{
          background:
            theme.mode === "dark"
              ? "linear-gradient(180deg, #0c0a12, #1a1628)"
              : "linear-gradient(180deg, #f7f6f9, #fff)",
          color: theme.mode === "dark" ? "#f4f2fa" : "#0f172a",
        }}
      >
        <p className="text-[10px] font-bold uppercase tracking-wide opacity-60">Live site preview</p>
        <div
          className="mt-2 flex items-center justify-between px-2 py-1.5"
          style={{
            borderRadius: theme.borderRadius,
            background: theme.mode === "dark" ? "#1a1628" : "#fff",
            border: `1px solid ${theme.mode === "dark" ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.08)"}`,
          }}
        >
          <span className="text-xs font-bold">Your business</span>
          <span
            className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
            style={{ backgroundColor: theme.accentColor }}
          >
            CTA
          </span>
        </div>
        <div
          className="mt-2 px-3 py-2 text-center text-xs font-semibold"
          style={{
            borderRadius: theme.borderRadius,
            backgroundColor: theme.primaryColor,
            color: onPrimary,
          }}
        >
          Primary button
        </div>
        <div
          className="mt-2 px-3 py-2 text-[11px]"
          style={{
            borderRadius: theme.borderRadius,
            background: theme.mode === "dark" ? "#1a1628" : "#fff",
            border: `1px solid ${theme.mode === "dark" ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.08)"}`,
          }}
        >
          Stack card text uses your theme surfaces.
        </div>
      </div>

      {message && <p className="text-xs text-brand-muted">{message}</p>}

      <div className="editor-sticky-actions">
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Applying…" : "Apply theme to site"}
        </Button>
      </div>
    </form>
  );
}