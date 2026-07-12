import type { CSSProperties } from "react";
import type { SectionStyle } from "@/core/types/section-style";
import { DEFAULT_SECTION_STYLE } from "@/core/types/section-style";
import { DEFAULT_LAYOUT, SECTION_LAYOUT_DIMS, type LayoutPresetId } from "@/core/types/layout-preset";
import { overlayCss } from "@/core/utils/media-bg";

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

function radius(corners: SectionStyle["corners"]): string {
  switch (corners) {
    case "sharp":
      return "4px";
    case "soft":
      return "10px";
    case "pill":
      return "9999px";
    case "round":
    default:
      return "14px";
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
      return primary;
    case "accent":
      return accent;
    case "custom":
      return custom || (role === "text" ? "var(--t-ink, #0f172a)" : "var(--t-surface, #fff)");
    case "surface":
      return "var(--t-surface, #ffffff)";
    case "muted":
      return "var(--t-muted, #64748b)";
    case "ink":
    default:
      if (role === "fill") return "var(--t-surface, #ffffff)";
      if (role === "border") return "var(--t-border, rgba(15,23,42,0.12))";
      return "var(--t-ink, #0f172a)";
  }
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
    backgroundColor = "var(--t-soft, rgba(15,23,42,0.06))";
  } else if (s.fill === "transparent" || s.fill === "outline") {
    backgroundColor = "transparent";
  }

  const borderColor =
    s.borderMode === "none"
      ? "transparent"
      : resolveToken(s.borderColorMode, s.customBorderColor, primary, accent, "border");

  const titleColor = resolveToken(s.titleColorMode, s.customTitleColor, primary, accent, "text");
  const bodyColor =
    s.bodyColorMode === "ink"
      ? "var(--t-ink, #0f172a)"
      : s.bodyColorMode === "custom" && s.customBodyColor
        ? s.customBodyColor
        : "var(--t-muted, #64748b)";

  const hasBgImage = Boolean(s.backgroundImageUrl?.trim());

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
    backgroundColor: "var(--t-soft, rgba(15,23,42,0.06))",
    borderRadius: radius(s.corners === "pill" ? "soft" : s.corners),
    border: `1px solid var(--t-border, rgba(15,23,42,0.1))`,
  };

  return { card, overlay, title, body, row, layout: s.layout ?? DEFAULT_LAYOUT };
}
