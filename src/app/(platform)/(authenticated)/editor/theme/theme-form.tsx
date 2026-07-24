"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { updateThemeAction } from "@/app/actions/business";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import type { ThemeConfig } from "@/core/types/page";
import {
  allTenantGoogleFontsHref,
  contrastOn,
  fontStackFor,
  TENANT_FONT_OPTIONS,
} from "@/core/utils/tenant-theme";

const RADII = [
  { label: "Soft", value: "10px" },
  { label: "Round", value: "14px" },
  { label: "Pill", value: "20px" },
  { label: "Sharp", value: "6px" },
] as const;
const MODES: ThemeConfig["mode"][] = ["light", "dark", "system"];

const PREVIEW_FONT_LINK_ID = "alinks-theme-preview-fonts";

export function ThemeForm({ businessId, initialTheme }: { businessId: string; initialTheme: ThemeConfig }) {
  const [theme, setTheme] = useState<ThemeConfig>(initialTheme);
  const [fontsReady, setFontsReady] = useState(false);
  const [isPending, startTransition] = useTransition();
  const onPrimary = contrastOn(theme.primaryColor);
  const liveFont = useMemo(() => fontStackFor(theme.fontFamily), [theme.fontFamily]);

  // Load all curated Google fonts into <head> so picker + preview update live
  useEffect(() => {
    if (typeof document === "undefined") return;

    let link = document.getElementById(PREVIEW_FONT_LINK_ID) as HTMLLinkElement | null;
    if (!link) {
      const preconnect1 = document.createElement("link");
      preconnect1.rel = "preconnect";
      preconnect1.href = "https://fonts.googleapis.com";
      preconnect1.dataset.alinksThemeFonts = "1";
      document.head.appendChild(preconnect1);

      const preconnect2 = document.createElement("link");
      preconnect2.rel = "preconnect";
      preconnect2.href = "https://fonts.gstatic.com";
      preconnect2.crossOrigin = "anonymous";
      preconnect2.dataset.alinksThemeFonts = "1";
      document.head.appendChild(preconnect2);

      link = document.createElement("link");
      link.id = PREVIEW_FONT_LINK_ID;
      link.rel = "stylesheet";
      link.href = allTenantGoogleFontsHref();
      link.onload = () => setFontsReady(true);
      link.onerror = () => setFontsReady(true);
      document.head.appendChild(link);
    } else {
      setFontsReady(true);
    }

    // If stylesheet already cached, mark ready
    if (link.sheet) setFontsReady(true);
  }, []);

  // After font id changes, ask the browser to use the face if available
  useEffect(() => {
    if (typeof document === "undefined" || !fontsReady) return;
    const family = liveFont.split(",")[0]?.replace(/"/g, "").trim();
    if (family && document.fonts?.load) {
      void document.fonts.load(`600 16px "${family}"`).catch(() => undefined);
    }
  }, [theme.fontFamily, liveFont, fontsReady]);

  return (
    <form
      className="space-y-3 pb-28"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const r = await updateThemeAction(businessId, theme);
          if (r.success) toast.success("Theme applied to your public site");
          else toast.error(r.error ?? "Save failed");
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
          {TENANT_FONT_OPTIONS.map((f) => {
            const stack = fontStackFor(f.id);
            const active = theme.fontFamily === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setTheme({ ...theme, fontFamily: f.id })}
                className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${
                  active
                    ? "border-brand-purple/40 bg-brand-purple/10 text-brand-ink"
                    : "border-brand-ink/10 bg-brand-surface text-brand-muted"
                }`}
                style={{ fontFamily: stack }}
                title={f.label}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-[10px] text-brand-muted">
          Tap a font — the live preview below updates immediately
          {!fontsReady ? " (loading typefaces…)" : ""}.
        </p>
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

      {/* Live mini preview — font + theme corners on section/cards */}
      <div
        key={`preview-${theme.fontFamily}-${theme.borderRadius}`}
        className="overflow-hidden border border-brand-ink/10 p-3 shadow-card"
        style={{
          background:
            theme.mode === "dark"
              ? "linear-gradient(180deg, #0c0a12, #1a1628)"
              : "linear-gradient(180deg, #f7f6f9, #fff)",
          color: theme.mode === "dark" ? "#f4f2fa" : "#0f172a",
          fontFamily: liveFont,
          borderRadius: theme.borderRadius,
          // so nested cards using CSS vars match Theme → Corners
          ["--t-radius" as string]: theme.borderRadius,
          ["--t-radius-sm" as string]: `max(6px, calc(${theme.borderRadius} * 0.55))`,
          ["--t-radius-lg" as string]: `max(14px, calc(${theme.borderRadius} * 1.25))`,
        }}
      >
        <p className="text-[10px] font-bold uppercase tracking-wide opacity-60" style={{ fontFamily: liveFont }}>
          Live site preview · {theme.fontFamily} · corners {theme.borderRadius}
        </p>
        <p className="mt-2 text-lg font-bold leading-tight tracking-tight" style={{ fontFamily: liveFont }}>
          Aa Bb Cc — Your business
        </p>
        <p className="mt-1 text-[12px] leading-snug opacity-80" style={{ fontFamily: liveFont }}>
          The quick brown fox jumps over the lazy dog. 0123456789
        </p>

        {/* Section / stack card (theme radius) */}
        <div
          className="mt-3 px-3 py-2.5"
          style={{
            borderRadius: "var(--t-radius)",
            background: theme.mode === "dark" ? "#1a1628" : "#fff",
            border: `1px solid ${theme.mode === "dark" ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.08)"}`,
            fontFamily: liveFont,
            boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 6px 16px -10px rgba(0,0,0,0.1)",
          }}
        >
          <p className="text-[9px] font-bold uppercase tracking-wide opacity-50">Section card</p>
          <p className="mt-0.5 text-xs font-bold" style={{ fontFamily: liveFont }}>
            About / Services card
          </p>
          <p className="mt-0.5 text-[11px] leading-snug opacity-75" style={{ fontFamily: liveFont }}>
            Stack section corners follow Theme → Corners.
          </p>
          {/* Inner row / item chip uses softer radius */}
          <div
            className="mt-2 px-2 py-1.5 text-[10px]"
            style={{
              borderRadius: "var(--t-radius-sm)",
              background: theme.mode === "dark" ? "rgba(255,255,255,.06)" : "rgba(15,23,42,.05)",
              fontFamily: liveFont,
            }}
          >
            Inner list row · soft corners
          </div>
        </div>

        <div
          className="mt-2 px-3 py-2 text-center text-xs font-semibold"
          style={{
            borderRadius: "var(--t-radius)",
            backgroundColor: theme.primaryColor,
            color: onPrimary,
            fontFamily: liveFont,
          }}
        >
          Link / primary button
        </div>
      </div>


      <div className="editor-sticky-actions">
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Applying…" : "Apply theme to site"}
        </Button>
      </div>
    </form>
  );
}
