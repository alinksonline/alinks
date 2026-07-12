import type { CSSProperties } from "react";
import type { GradientStop, MediaBackground, MediaOverlay } from "@/core/types/media-bg";

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 1;
  return Math.min(1, Math.max(0, n));
}

/** Hex (#rgb / #rrggbb) + opacity → rgba() */
export function hexToRgba(hex: string, opacity: number): string {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    return `rgba(0,0,0,${clamp01(opacity)})`;
  }
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${clamp01(opacity)})`;
}

export function gradientCss(angle: number, stops: GradientStop[]): string {
  const sorted = [...stops].sort((a, b) => a.at - b.at);
  const parts = sorted.map((s) => `${hexToRgba(s.color, s.opacity)} ${Math.min(100, Math.max(0, s.at))}%`);
  return `linear-gradient(${angle}deg, ${parts.join(", ")})`;
}

export function overlayCss(overlay?: MediaOverlay | null): string | undefined {
  if (!overlay || overlay.kind === "none") return undefined;
  if (overlay.kind === "solid") return hexToRgba(overlay.color, overlay.opacity);
  return gradientCss(overlay.angle, overlay.stops);
}

export function backgroundCss(bg?: MediaBackground | null): CSSProperties {
  if (!bg || bg.kind === "none") return {};
  if (bg.kind === "image") {
    return {
      backgroundImage: `url(${bg.url})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  if (bg.kind === "solid") {
    return { backgroundColor: hexToRgba(bg.color, bg.opacity ?? 1) };
  }
  return { backgroundImage: gradientCss(bg.angle, bg.stops) };
}

/**
 * Layered surface: base (image/gradient/solid) + optional overlay on top.
 * Returns style for a relative container; overlay is separate absolute layer CSS.
 */
export function layeredBackground(
  bg: MediaBackground | null | undefined,
  overlay: MediaOverlay | null | undefined,
): { base: CSSProperties; overlay?: CSSProperties } {
  const base = backgroundCss(bg);
  const o = overlayCss(overlay);
  if (!o) return { base };
  return {
    base: { ...base, position: "relative" as const },
    overlay: {
      position: "absolute",
      inset: 0,
      background: o,
      pointerEvents: "none",
    },
  };
}
