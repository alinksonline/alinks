import type { LayoutPresetId } from "./layout-preset";
import { DEFAULT_LAYOUT } from "./layout-preset";
import type { MediaBackground, MediaOverlay } from "./media-bg";
import { DEFAULT_OVERLAY_GRADIENT } from "./media-bg";

export type HeroCtaStyle = "solid" | "gradient" | "outline" | "ghost";

/** Visual options for the home hero (Styling tab). */
export type HeroStyle = {
  /** Legacy simple overlay level — still supported when mediaOverlay missing */
  overlay?: "soft" | "medium" | "strong";
  /** Full overlay model: none · solid+opacity · gradient per-stop opacity */
  mediaOverlay?: MediaOverlay;
  /** When no cover image: solid/gradient background */
  mediaBackground?: MediaBackground;
  /** When no cover image: use theme primary→accent gradient (default true) */
  useThemeGradient?: boolean;
  ctaStyle?: HeroCtaStyle;
  ctaCorners?: "sharp" | "soft" | "round" | "pill";
};

export const DEFAULT_HERO_STYLE: HeroStyle = {
  overlay: "medium",
  mediaOverlay: DEFAULT_OVERLAY_GRADIENT,
  useThemeGradient: true,
  ctaStyle: "solid",
  ctaCorners: "round",
};

export { DEFAULT_LAYOUT };
export type { LayoutPresetId };
