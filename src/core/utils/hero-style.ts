import type { CSSProperties } from "react";
import type { PageHero } from "@/core/types/page";
import type { HeroStyle } from "@/core/types/hero-style";
import { DEFAULT_HERO_STYLE } from "@/core/types/hero-style";
import {
  DEFAULT_LAYOUT,
  HERO_LAYOUT_DIMS,
  type LayoutPresetId,
} from "@/core/types/layout-preset";

export function mergeHeroStyle(raw?: HeroStyle | null): Required<HeroStyle> {
  return { ...DEFAULT_HERO_STYLE, ...raw };
}

function overlayAlpha(level: HeroStyle["overlay"]): number {
  switch (level) {
    case "soft":
      return 0.45;
    case "strong":
      return 0.88;
    case "medium":
    default:
      return 0.72;
  }
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
  const a = overlayAlpha(style.overlay);
  const hasImage = Boolean(hero.imageUrl?.trim());

  let background: string;
  if (hasImage) {
    background = `linear-gradient(to top, rgba(0,0,0,${a}), rgba(0,0,0,${a * 0.35})), url(${hero.imageUrl}) center/cover`;
  } else if (style.useThemeGradient) {
    background = `linear-gradient(145deg, ${primaryColor}, ${accentColor})`;
  } else {
    background = primaryColor;
  }

  const section: CSSProperties = {
    position: "relative",
    display: "flex",
    alignItems: "flex-end",
    minHeight: heroHeight(dims.height),
    color: "#fff",
    background,
    backgroundSize: hasImage ? "cover" : undefined,
    backgroundPosition: hasImage ? "center" : undefined,
    width: dims.inset ? "92%" : "100%",
    marginLeft: dims.inset ? "auto" : undefined,
    marginRight: dims.inset ? "auto" : undefined,
    borderRadius: dims.inset ? "var(--t-radius, 14px)" : undefined,
    overflow: "hidden",
  };

  const inner: CSSProperties = {
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

  let ctaBg = primaryColor;
  let ctaColor = "#fff";
  let ctaBorder = "none";
  if (style.ctaStyle === "ghost") {
    ctaBg = "rgba(255,255,255,0.15)";
    ctaColor = "#fff";
  } else if (style.ctaStyle === "outline") {
    ctaBg = "transparent";
    ctaColor = "#fff";
    ctaBorder = "1.5px solid rgba(255,255,255,0.85)";
  } else if (style.ctaStyle === "gradient") {
    ctaBg = `linear-gradient(135deg, ${primaryColor}, ${accentColor})`;
  } else {
    // solid — light surface CTA for contrast on dark hero
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
    section,
    inner,
    title,
    tagline,
    cta,
    layout,
    showCta: Boolean(hero.ctaText?.trim()),
  };
}
