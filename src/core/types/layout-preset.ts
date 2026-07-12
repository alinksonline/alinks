/** Five contemporary layouts — every stack widget + home hero. */
export type LayoutPresetId = "pulse" | "orbit" | "snap" | "frame" | "bloom";

export type LayoutPresetMeta = {
  id: LayoutPresetId;
  name: string;
  tagline: string;
};

export const LAYOUT_PRESETS: LayoutPresetMeta[] = [
  { id: "pulse", name: "Pulse", tagline: "Classic stack rhythm" },
  { id: "orbit", name: "Orbit", tagline: "Centered, social energy" },
  { id: "snap", name: "Snap", tagline: "Compact, dense" },
  { id: "frame", name: "Frame", tagline: "Inset editorial card" },
  { id: "bloom", name: "Bloom", tagline: "Roomy, statement" },
];

export type SectionLayoutDims = {
  align: "left" | "center" | "right";
  padding: "compact" | "normal" | "roomy";
  width: "full" | "inset";
};

export type HeroLayoutDims = {
  align: "left" | "center" | "right";
  height: "sm" | "md" | "lg";
  inset: boolean;
  padding: "compact" | "normal" | "roomy";
};

export const SECTION_LAYOUT_DIMS: Record<LayoutPresetId, SectionLayoutDims> = {
  pulse: { align: "left", padding: "normal", width: "full" },
  orbit: { align: "center", padding: "normal", width: "full" },
  snap: { align: "left", padding: "compact", width: "full" },
  frame: { align: "left", padding: "normal", width: "inset" },
  bloom: { align: "left", padding: "roomy", width: "full" },
};

export const HERO_LAYOUT_DIMS: Record<LayoutPresetId, HeroLayoutDims> = {
  pulse: { align: "left", height: "md", inset: false, padding: "normal" },
  orbit: { align: "center", height: "md", inset: false, padding: "normal" },
  snap: { align: "left", height: "sm", inset: false, padding: "compact" },
  frame: { align: "left", height: "md", inset: true, padding: "normal" },
  bloom: { align: "left", height: "lg", inset: false, padding: "roomy" },
};

export const DEFAULT_LAYOUT: LayoutPresetId = "pulse";
