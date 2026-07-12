/** Shared background + overlay model for hero, sections, pages. */

export type GradientStop = {
  /** Hex color without alpha, e.g. #0f172a */
  color: string;
  /** 0–1 per-node opacity */
  opacity: number;
  /** 0–100 position along gradient */
  at: number;
};

export type MediaOverlay =
  | { kind: "none" }
  | { kind: "solid"; color: string; opacity: number }
  | { kind: "gradient"; angle: number; stops: GradientStop[] };

export type MediaBackground =
  | { kind: "none" }
  | { kind: "image"; url: string }
  | { kind: "solid"; color: string; opacity?: number }
  | { kind: "gradient"; angle: number; stops: GradientStop[] };

export const DEFAULT_OVERLAY_GRADIENT: MediaOverlay = {
  kind: "gradient",
  angle: 180,
  stops: [
    { color: "#000000", opacity: 0.75, at: 0 },
    { color: "#000000", opacity: 0.25, at: 100 },
  ],
};

export const DEFAULT_THEME_GRADIENT = (primary: string, accent: string): MediaBackground => ({
  kind: "gradient",
  angle: 145,
  stops: [
    { color: primary, opacity: 1, at: 0 },
    { color: accent, opacity: 1, at: 100 },
  ],
});
