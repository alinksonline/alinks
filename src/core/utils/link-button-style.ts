import type { CSSProperties } from "react";
import type { LinkButtonStyle, LinkCorners, LinkThickness } from "@/core/types/link-button-style";
import { DEFAULT_LINK_STYLE } from "@/core/types/link-button-style";
import { contrastOn } from "@/core/utils/tenant-theme";

export function mergeLinkStyle(raw?: LinkButtonStyle | null): LinkButtonStyle {
  return { ...DEFAULT_LINK_STYLE, ...raw };
}

/** Link corners scale from Theme → Corners (--t-radius). */
function radius(corners: LinkCorners | undefined): string {
  switch (corners ?? "round") {
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

function paddingY(t: LinkThickness | undefined): string {
  switch (t ?? "medium") {
    case "thin":
      return "0.4rem";
    case "thick":
      return "0.95rem";
    default:
      return "0.65rem";
  }
}

function fontSize(t: LinkThickness | undefined): string {
  switch (t ?? "medium") {
    case "thin":
      return "0.75rem";
    case "thick":
      return "0.9375rem";
    default:
      return "0.8125rem";
  }
}

function resolveColor(
  mode: LinkButtonStyle["colorMode"] | undefined,
  custom: string | undefined,
  primary: string,
  accent: string,
): string {
  if (mode === "accent") return accent;
  if (mode === "custom" && custom) return custom;
  return primary;
}

/**
 * Compute inline styles for a themed link button.
 * primary/accent come from tenant theme (or editor fallbacks).
 */
export function resolveLinkButtonCss(
  styleRaw: LinkButtonStyle | undefined,
  primaryColor: string,
  accentColor: string,
): {
  style: CSSProperties;
  className: string;
  textColor: string;
} {
  const s = mergeLinkStyle(styleRaw);
  const fillA = resolveColor(s.colorMode, s.customColor, primaryColor, accentColor);
  const fillB =
    s.fill === "gradient"
      ? s.gradientTo || (s.colorMode === "accent" ? primaryColor : accentColor)
      : fillA;

  // Always readable label on brand fill (white on dark purple, dark on light)
  const textColor = contrastOn(fillA);
  const borderW = s.borderMode === "none" ? 0 : Math.min(4, Math.max(1, s.borderWidth ?? 1.5));

  const style: CSSProperties = {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    paddingTop: paddingY(s.thickness),
    paddingBottom: paddingY(s.thickness),
    paddingLeft: "0.85rem",
    paddingRight: "0.85rem",
    fontSize: fontSize(s.thickness),
    fontWeight: 600,
    letterSpacing: "-0.01em",
    textAlign: "center",
    textDecoration: "none",
    borderRadius: radius(s.corners),
    color: textColor,
    borderStyle: borderW ? "solid" : "none",
    borderWidth: borderW ? `${borderW}px` : 0,
    boxSizing: "border-box",
    transition: "transform 0.12s ease, opacity 0.12s ease",
  };

  if (s.fill === "gradient") {
    style.backgroundImage = `linear-gradient(135deg, ${fillA}, ${fillB})`;
    style.backgroundColor = fillA;
  } else {
    style.backgroundColor = fillA;
  }
  style.color = textColor;

  if (s.borderMode === "solid") {
    style.borderColor = resolveColor(s.borderColorMode, s.borderCustomColor, primaryColor, accentColor);
  } else if (s.borderMode === "gradient") {
    // Approximate gradient border via double background + padding-box
    const bA = resolveColor(s.borderColorMode, s.borderCustomColor, primaryColor, accentColor);
    const bB = s.borderGradientTo || accentColor;
    style.borderColor = "transparent";
    style.backgroundImage = [
      s.fill === "gradient" ? `linear-gradient(135deg, ${fillA}, ${fillB})` : `linear-gradient(${fillA}, ${fillA})`,
      `linear-gradient(135deg, ${bA}, ${bB})`,
    ].join(", ");
    style.backgroundOrigin = "padding-box, border-box";
    style.backgroundClip = "padding-box, border-box";
    style.borderStyle = "solid";
    style.borderWidth = `${borderW}px`;
  } else {
    style.borderColor = "transparent";
  }

  return {
    style,
    className: "link-btn active:scale-[0.99]",
    textColor,
  };
}
