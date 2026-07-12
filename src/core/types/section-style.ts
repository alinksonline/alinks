import type { LayoutPresetId } from "./layout-preset";
import { DEFAULT_LAYOUT } from "./layout-preset";

/** Shared styling + layout for card-style widgets (Highlights, Text, Services, etc.). */
export type SectionFill = "solid" | "soft" | "outline" | "transparent";
export type SectionCorners = "sharp" | "soft" | "round" | "pill";
export type SectionAlign = "left" | "center" | "right";
export type SectionPadding = "compact" | "normal" | "roomy";
export type SectionWidth = "full" | "inset";
export type SectionColorMode = "ink" | "muted" | "primary" | "accent" | "surface" | "custom";

export type SectionStyle = {
  /** Styling */
  fill?: SectionFill;
  fillColorMode?: SectionColorMode;
  customFill?: string;
  titleColorMode?: SectionColorMode;
  customTitleColor?: string;
  bodyColorMode?: SectionColorMode;
  customBodyColor?: string;
  corners?: SectionCorners;
  borderMode?: "none" | "solid";
  borderColorMode?: SectionColorMode;
  customBorderColor?: string;
  /**
   * Layout — one of 5 presets (Pulse / Orbit / Snap / Frame / Bloom).
   * Drives align, padding, width.
   */
  layout?: LayoutPresetId;
  /** @deprecated use layout preset; kept for older saved blocks */
  align?: SectionAlign;
  padding?: SectionPadding;
  width?: SectionWidth;
};

export const DEFAULT_SECTION_STYLE: Required<
  Pick<
    SectionStyle,
    | "fill"
    | "fillColorMode"
    | "titleColorMode"
    | "bodyColorMode"
    | "corners"
    | "borderMode"
    | "borderColorMode"
    | "layout"
  >
> = {
  fill: "solid",
  fillColorMode: "surface",
  titleColorMode: "ink",
  bodyColorMode: "muted",
  corners: "round",
  borderMode: "solid",
  borderColorMode: "ink",
  layout: DEFAULT_LAYOUT,
};
