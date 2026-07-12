"use client";

import { useState, type ReactNode } from "react";
import type { PageHero } from "@/core/types/page";
import type { HeroStyle } from "@/core/types/hero-style";
import { DEFAULT_HERO_STYLE } from "@/core/types/hero-style";
import type { LayoutPresetId } from "@/core/types/layout-preset";
import { cn } from "@/core/utils/cn";
import { LayoutPresetPicker } from "./layout-preset-picker";
import { resolveHeroPresentation } from "@/core/utils/hero-style";
import { ImageField } from "@/components/shared/image-field";
import { OverlayEditor } from "@/components/shared/overlay-editor";
import type { MediaOverlay } from "@/core/types/media-bg";
import { DEFAULT_OVERLAY_GRADIENT } from "@/core/types/media-bg";

type EditTab = "content" | "styling" | "layout";

const TABS: { id: EditTab; label: string }[] = [
  { id: "content", label: "Content" },
  { id: "styling", label: "Styling" },
  { id: "layout", label: "Layout" },
];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-2 py-1 text-[10px] font-semibold capitalize",
        active
          ? "border-brand-purple/40 bg-brand-purple/10 text-brand-ink"
          : "border-brand-ink/10 bg-brand-surface text-brand-muted",
      )}
    >
      {children}
    </button>
  );
}

/** Home hero editor — Content · Styling · Layout (Pulse–Bloom). */
export function HeroEditSheet({
  hero,
  primaryColor,
  accentColor,
  onChange,
  onClose,
}: {
  hero: PageHero;
  primaryColor: string;
  accentColor: string;
  onChange: (h: PageHero) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<EditTab>("content");
  const style: HeroStyle = { ...DEFAULT_HERO_STYLE, ...hero.style };
  const setStyle = (patch: Partial<HeroStyle>) =>
    onChange({ ...hero, style: { ...style, ...patch } });
  const preview = resolveHeroPresentation(hero, primaryColor, accentColor);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/45" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[min(90dvh,100%)] w-full max-w-[var(--app-max-width)] flex-col rounded-t-2xl bg-white shadow-2xl dark:bg-[rgb(var(--color-brand-surface))]"
        style={{ paddingBottom: "var(--safe-bottom)" }}
      >
        <div className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-slate-200 dark:bg-white/15" />
        <div className="flex items-center justify-between px-4 py-2.5">
          <h2 className="text-sm font-bold text-brand-ink">Hero</h2>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center text-lg text-brand-muted"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="mx-3 flex gap-0.5 rounded-xl bg-brand-mist/80 p-0.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-[11px] font-semibold transition",
                tab === t.id ? "bg-brand-surface text-brand-ink shadow-sm" : "text-brand-muted",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {/* Live mini preview */}
          <div className="overflow-hidden rounded-xl" style={preview.section}>
            {preview.overlayLayer ? <div style={preview.overlayLayer} /> : null}
            <div style={preview.inner}>
              <p style={{ ...preview.title, fontSize: "1rem" }}>{hero.title || "Headline"}</p>
              <p style={{ ...preview.tagline, fontSize: "0.7rem" }}>{hero.tagline || "Tagline"}</p>
              {preview.showCta && (
                <span style={{ ...preview.cta, marginTop: "0.5rem", minHeight: "1.75rem", fontSize: "0.7rem" }}>
                  {hero.ctaText}
                </span>
              )}
            </div>
          </div>

          {tab === "content" && (
            <>
              <label className="block space-y-1">
                <span className="text-[11px] font-semibold text-brand-muted">Headline</span>
                <input
                  className="premium-input"
                  value={hero.title}
                  onChange={(e) => onChange({ ...hero, title: e.target.value })}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] font-semibold text-brand-muted">Tagline</span>
                <textarea
                  className="premium-input min-h-[4rem] resize-y"
                  value={hero.tagline}
                  onChange={(e) => onChange({ ...hero, tagline: e.target.value })}
                  rows={2}
                />
              </label>
              <ImageField
                label="Cover image"
                value={hero.imageUrl}
                onChange={(url) => onChange({ ...hero, imageUrl: url })}
                hint="Upload from phone or import a URL — always stored as compressed WebP."
              />
              <div className="grid grid-cols-2 gap-2">
                <label className="block space-y-1">
                  <span className="text-[11px] font-semibold text-brand-muted">Button</span>
                  <input
                    className="premium-input"
                    value={hero.ctaText}
                    onChange={(e) => onChange({ ...hero, ctaText: e.target.value })}
                    placeholder="Optional"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[11px] font-semibold text-brand-muted">Link</span>
                  <input
                    className="premium-input font-mono text-xs"
                    value={hero.ctaLink}
                    onChange={(e) => onChange({ ...hero, ctaLink: e.target.value })}
                    placeholder="/contact"
                  />
                </label>
              </div>
              <p className="text-[10px] text-brand-muted">Leave button empty to hide the CTA on the public site.</p>
            </>
          )}

          {tab === "styling" && (
            <div className="space-y-3">
              <OverlayEditor
                label="Overlay (on image / background)"
                value={
                  (style.mediaOverlay as MediaOverlay | undefined) ??
                  DEFAULT_OVERLAY_GRADIENT
                }
                onChange={(mediaOverlay) => setStyle({ mediaOverlay })}
              />
              <label className="flex items-center justify-between gap-2 rounded-xl border border-brand-ink/10 px-3 py-2">
                <span className="text-[11px] font-semibold text-brand-ink">Theme gradient if no photo</span>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-brand-purple"
                  checked={style.useThemeGradient !== false}
                  onChange={(e) => setStyle({ useThemeGradient: e.target.checked })}
                />
              </label>
              <div>
                <p className="mb-1 text-[10px] font-semibold text-brand-muted">CTA style</p>
                <div className="flex flex-wrap gap-1">
                  {(["solid", "gradient", "outline", "ghost"] as const).map((c) => (
                    <Chip key={c} active={style.ctaStyle === c} onClick={() => setStyle({ ctaStyle: c })}>
                      {c}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-semibold text-brand-muted">CTA corners</p>
                <div className="flex flex-wrap gap-1">
                  {(["sharp", "soft", "round", "pill"] as const).map((c) => (
                    <Chip key={c} active={style.ctaCorners === c} onClick={() => setStyle({ ctaCorners: c })}>
                      {c}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "layout" && (
            <LayoutPresetPicker
              value={hero.layout}
              onChange={(layout: LayoutPresetId) => onChange({ ...hero, layout })}
            />
          )}
        </div>

        <div className="border-t border-brand-ink/8 px-4 py-2.5">
          <button type="button" className="premium-btn-bronze" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </>
  );
}
