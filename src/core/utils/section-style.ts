import type { CSSProperties } from "react";
import type { SectionStyle } from "@/core/types/section-style";
import { DEFAULT_SECTION_STYLE } from "@/core/types/section-style";
import { DEFAULT_LAYOUT, SECTION_LAYOUT_DIMS, type LayoutPresetId } from "@/core/types/layout-preset";
import { overlayCss } from "@/core/utils/media-bg";
import { contrastOn } from "@/core/utils/tenant-theme";

export function mergeSectionStyle(raw?: SectionStyle | null): SectionStyle {
  const base = { ...DEFAULT_SECTION_STYLE, ...raw };
  const layoutId = (base.layout ?? DEFAULT_LAYOUT) as LayoutPresetId;
  const dims = SECTION_LAYOUT_DIMS[layoutId] ?? SECTION_LAYOUT_DIMS.pulse;
  // Preset wins for layout geometry
  return {
    ...base,
    layout: layoutId,
    align: dims.align,
    padding: dims.padding,
    width: dims.width,
  };
}

/**
 * Section/card corners follow the site Theme radius (--t-radius),
 * so Editor → Theme → Corners changes stack cards on the public page.
 * Per-widget corners only scale relative to that theme value.
 */
function radius(corners: SectionStyle["corners"]): string {
  switch (corners) {
    case "sharp":
      return "max(2px, calc(var(--t-radius, 12px) * 0.28))";
    case "soft":
      return "var(--t-radius-sm, max(6px, calc(var(--t-radius, 12px) * 0.55)))";
    case "pill":
      return "9999px";
    case "round":
    default:
      return "var(--t-radius, 12px)";
  }
}

function padding(p: SectionStyle["padding"]): string {
  switch (p) {
    case "compact":
      return "0.55rem 0.75rem";
    case "roomy":
      return "1.15rem 1.2rem";
    case "normal":
    default:
      return "0.75rem 0.9rem";
  }
}

function resolveToken(
  mode: SectionStyle["fillColorMode"] | SectionStyle["titleColorMode"] | undefined,
  custom: string | undefined,
  primary: string,
  accent: string,
  role: "fill" | "text" | "border",
): string {
  switch (mode) {
    case "primary":
      // Text/icons: theme-safe primary (lightened on dark sites), not raw brand hex.
      return role === "text" ? "var(--t-primary-text, var(--t-primary))" : primary;
    case "accent":
      return role === "text" ? "var(--t-primary-text, var(--t-accent))" : accent;
    case "custom":
      return custom || (role === "text" ? "var(--t-ink)" : "var(--t-surface)");
    case "surface":
      return "var(--t-surface)";
    case "muted":
      return "var(--t-muted)";
    case "ink":
    default:
      if (role === "fill") return "var(--t-surface)";
      if (role === "border") return "var(--t-border)";
      // Never hardcode #0f172a — dark mode ink is light via CSS vars
      return "var(--t-ink)";
  }
}

/**
 * When a card has a dark brand fill (primary/accent/custom hex), labels must
 * use contrastOn(fill) — never dark purple on dark purple.
 */
function textOnKnownFill(fillHex: string, role: "title" | "body"): string {
  const on = contrastOn(fillHex);
  if (role === "title") return on;
  // Body slightly softer but still on the same contrast side
  return on === "#ffffff" ? "rgba(255,255,255,0.88)" : "rgba(15,23,42,0.72)";
}

/** Card container + title/body colors from section style + layout preset. */
export function resolveSectionCardCss(
  styleRaw: SectionStyle | undefined,
  primaryColor: string,
  accentColor: string,
): {
  card: CSSProperties;
  overlay?: CSSProperties;
  title: CSSProperties;
  body: CSSProperties;
  row: CSSProperties;
  layout: LayoutPresetId;
} {
  const s = mergeSectionStyle(styleRaw);
  const primary = primaryColor;
  const accent = accentColor;

  let backgroundColor = resolveToken(s.fillColorMode, s.customFill, primary, accent, "fill");
  if (s.fill === "soft") {
    backgroundColor = "var(--t-soft)";
  } else if (s.fill === "transparent" || s.fill === "outline") {
    backgroundColor = "transparent";
  }

  const borderColor =
    s.borderMode === "none"
      ? "transparent"
      : resolveToken(s.borderColorMode, s.customBorderColor, primary, accent, "border");

  let titleColor = resolveToken(s.titleColorMode, s.customTitleColor, primary, accent, "text");
  let bodyColor =
    s.bodyColorMode === "custom" && s.customBodyColor
      ? s.customBodyColor
      : s.bodyColorMode === "primary" || s.bodyColorMode === "accent"
        ? resolveToken(s.bodyColorMode, undefined, primary, accent, "text")
        : s.bodyColorMode === "ink"
          ? "var(--t-ink)"
          : "var(--t-muted)";

  const hasBgImage = Boolean(s.backgroundImageUrl?.trim());
  const solidBrandFill =
    s.fill === "solid" &&
    (s.fillColorMode === "primary" || s.fillColorMode === "accent" || s.fillColorMode === "custom");

  // Dark brand fills: force readable title/body unless user set a custom text color
  if (solidBrandFill && s.titleColorMode !== "custom") {
    const fillHex =
      s.fillColorMode === "accent" ? accent : s.fillColorMode === "custom" && s.customFill ? s.customFill : primary;
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(fillHex.trim())) {
      titleColor = textOnKnownFill(fillHex.trim(), "title");
      if (s.bodyColorMode !== "custom") {
        bodyColor = textOnKnownFill(fillHex.trim(), "body");
      }
    } else {
      // CSS var fills: on-primary tokens
      titleColor = "var(--t-on-primary, #ffffff)";
      if (s.bodyColorMode !== "custom") {
        bodyColor = "color-mix(in srgb, var(--t-on-primary, #fff) 88%, transparent)";
      }
    }
  }

  // Photo backgrounds → light type (same as hero)
  if (hasBgImage && s.titleColorMode !== "custom") {
    titleColor = "#ffffff";
    if (s.bodyColorMode !== "custom") {
      bodyColor = "rgba(255,255,255,0.9)";
    }
  }

  const card: CSSProperties = {
    position: "relative",
    overflow: "hidden",
    backgroundColor: hasBgImage ? undefined : backgroundColor,
    backgroundImage: hasBgImage ? `url(${s.backgroundImageUrl})` : undefined,
    backgroundSize: hasBgImage ? "cover" : undefined,
    backgroundPosition: hasBgImage ? "center" : undefined,
    color: titleColor,
    borderRadius: radius(s.corners),
    border: s.borderMode === "none" ? "1px solid transparent" : `1px solid ${borderColor}`,
    padding: padding(s.padding),
    textAlign: s.align ?? "left",
    width: s.width === "inset" ? "92%" : "100%",
    marginLeft: s.width === "inset" ? "auto" : undefined,
    marginRight: s.width === "inset" ? "auto" : undefined,
    boxShadow:
      s.fill === "transparent" || s.fill === "outline"
        ? "none"
        : "0 1px 2px rgba(0,0,0,0.04), 0 6px 16px -10px rgba(0,0,0,0.1)",
  };

  const o = overlayCss(s.mediaOverlay);
  const overlay: CSSProperties | undefined = o
    ? { position: "absolute", inset: 0, background: o, pointerEvents: "none" }
    : undefined;

  const title: CSSProperties = {
    fontSize: "0.875rem",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    color: titleColor,
  };

  const body: CSSProperties = {
    marginTop: "0.25rem",
    fontSize: "0.75rem",
    lineHeight: 1.5,
    color: bodyColor,
  };

  const row: CSSProperties = {
    backgroundColor: "var(--t-soft)",
    color: "var(--t-ink)",
    borderRadius: radius(s.corners === "pill" ? "soft" : s.corners),
    border: `1px solid var(--t-border)`,
  };

  return { card, overlay, title, body, row, layout: s.layout ?? DEFAULT_LAYOUT };
}
