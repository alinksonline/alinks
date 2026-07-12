import type { CSSProperties } from "react";
import type { PageHero } from "@/core/types/page";
import type { HeroStyle } from "@/core/types/hero-style";
import { DEFAULT_HERO_STYLE } from "@/core/types/hero-style";
import type { MediaOverlay } from "@/core/types/media-bg";
import {
  DEFAULT_LAYOUT,
  HERO_LAYOUT_DIMS,
  type LayoutPresetId,
} from "@/core/types/layout-preset";
import { backgroundCss, hexToRgba, overlayCss } from "@/core/utils/media-bg";

export function mergeHeroStyle(raw?: HeroStyle | null): HeroStyle {
  return { ...DEFAULT_HERO_STYLE, ...raw };
}

function legacyOverlay(level: HeroStyle["overlay"]): MediaOverlay {
  const o = level === "soft" ? 0.45 : level === "strong" ? 0.88 : 0.72;
  return {
    kind: "gradient",
    angle: 180,
    stops: [
      { color: "#000000", opacity: o, at: 0 },
      { color: "#000000", opacity: o * 0.35, at: 100 },
    ],
  };
}

function heroHeight(h: "sm" | "md" | "lg"): string {
  switch (h) {
    case "sm":
      return "min(28vh, 200px)";
    case "lg":
      return "min(52vh, 380px)";
    case "md":
    default:
      return "min(38vh, 280px)";
  }
}

function heroPad(p: "compact" | "normal" | "roomy"): string {
  switch (p) {
    case "compact":
      return "2.5rem 0.85rem 1rem";
    case "roomy":
      return "4.5rem 1.15rem 2rem";
    case "normal":
    default:
      return "3.5rem 1rem 1.5rem";
  }
}

function ctaRadius(c: HeroStyle["ctaCorners"]): string {
  switch (c) {
    case "sharp":
      return "4px";
    case "soft":
      return "10px";
    case "pill":
      return "9999px";
    case "round":
    default:
      return "12px";
  }
}

export function resolveHeroPresentation(
  hero: PageHero,
  primaryColor: string,
  accentColor: string,
): {
  section: CSSProperties;
  overlayLayer?: CSSProperties;
  inner: CSSProperties;
  title: CSSProperties;
  tagline: CSSProperties;
  cta: CSSProperties;
  layout: LayoutPresetId;
  showCta: boolean;
} {
  const layout = (hero.layout ?? DEFAULT_LAYOUT) as LayoutPresetId;
  const dims = HERO_LAYOUT_DIMS[layout] ?? HERO_LAYOUT_DIMS.pulse;
  const style = mergeHeroStyle(hero.style);
  const hasImage = Boolean(hero.imageUrl?.trim());

  let base: CSSProperties = {
    position: "relative",
    display: "flex",
    alignItems: "flex-end",
    minHeight: heroHeight(dims.height),
    color: "#fff",
    width: dims.inset ? "92%" : "100%",
    marginLeft: dims.inset ? "auto" : undefined,
    marginRight: dims.inset ? "auto" : undefined,
    borderRadius: dims.inset ? "var(--t-radius, 14px)" : undefined,
    overflow: "hidden",
  };

  if (hasImage) {
    base = {
      ...base,
      backgroundImage: `url(${hero.imageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  } else if (style.mediaBackground && style.mediaBackground.kind !== "none") {
    base = { ...base, ...backgroundCss(style.mediaBackground) };
  } else if (style.useThemeGradient !== false) {
    base = {
      ...base,
      backgroundImage: `linear-gradient(145deg, ${primaryColor}, ${accentColor})`,
    };
  } else {
    base = { ...base, backgroundColor: primaryColor };
  }

  const mediaOverlay: MediaOverlay | undefined =
    style.mediaOverlay ??
    (hasImage ? legacyOverlay(style.overlay) : { kind: "none" });

  const oCss = overlayCss(mediaOverlay);
  const overlayLayer: CSSProperties | undefined = oCss
    ? {
        position: "absolute",
        inset: 0,
        background: oCss,
        pointerEvents: "none",
      }
    : undefined;

  const inner: CSSProperties = {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "var(--app-max-width, 430px)",
    margin: "0 auto",
    padding: heroPad(dims.padding),
    textAlign: dims.align,
  };

  const title: CSSProperties = {
    fontSize: dims.height === "sm" ? "1.25rem" : dims.height === "lg" ? "1.75rem" : "1.5rem",
    fontWeight: 900,
    letterSpacing: "-0.02em",
    lineHeight: 1.15,
  };

  const tagline: CSSProperties = {
    marginTop: "0.35rem",
    fontSize: "0.875rem",
    color: "rgba(255,255,255,0.9)",
    lineHeight: 1.4,
  };

  let ctaBg: string = primaryColor;
  let ctaColor = "#fff";
  let ctaBorder = "none";
  if (style.ctaStyle === "ghost") {
    ctaBg = "rgba(255,255,255,0.15)";
  } else if (style.ctaStyle === "outline") {
    ctaBg = "transparent";
    ctaBorder = "1.5px solid rgba(255,255,255,0.85)";
  } else if (style.ctaStyle === "gradient") {
    ctaBg = `linear-gradient(135deg, ${primaryColor}, ${accentColor})`;
  } else {
    ctaBg = "var(--t-surface, #fff)";
    ctaColor = primaryColor;
  }

  const cta: CSSProperties = {
    marginTop: "1rem",
    display: "inline-flex",
    minHeight: "2.25rem",
    width: dims.align === "center" ? "auto" : "100%",
    maxWidth: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.5rem 1rem",
    fontSize: "0.8125rem",
    fontWeight: 700,
    borderRadius: ctaRadius(style.ctaCorners),
    background: ctaBg,
    color: ctaColor,
    border: ctaBorder,
    textDecoration: "none",
  };

  return {
    section: base,
    overlayLayer,
    inner,
    title,
    tagline,
    cta,
    layout,
    showCta: Boolean(hero.ctaText?.trim()),
  };
}

// re-export for convenience
export { hexToRgba };
