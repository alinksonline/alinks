"use client";

import type { ReactNode } from "react";
import type { LinkButtonStyle, LinkIconName } from "@/core/types/link-button-style";
import {
  DEFAULT_LINK_STYLE,
  LINK_ICON_OPTIONS,
} from "@/core/types/link-button-style";
import { LinkGlyphIcon } from "@/components/editor/widget-icons";
import { LinkButton } from "@/components/tenant/link-button";
import { cn } from "@/core/utils/cn";

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-2 py-1 text-[10px] font-semibold capitalize",
        active
          ? "border-brand-purple/40 bg-brand-purple/10 text-brand-ink"
          : "border-brand-ink/10 bg-brand-surface text-brand-muted",
      )}
    >
      {children}
    </button>
  );
}

/** Compact controls for link button thickness, fill, corners, border, icon. */
export function LinkStyleEditor({
  style,
  label,
  href,
  primaryColor,
  accentColor,
  onChange,
}: {
  style?: LinkButtonStyle;
  label: string;
  href: string;
  primaryColor: string;
  accentColor: string;
  onChange: (next: LinkButtonStyle) => void;
}) {
  const s: LinkButtonStyle = { ...DEFAULT_LINK_STYLE, ...style };
  const set = (patch: Partial<LinkButtonStyle>) => onChange({ ...s, ...patch });

  return (
    <div className="space-y-3 rounded-xl border border-brand-ink/10 bg-brand-mist/40 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">Button style</p>

      <div className="pointer-events-none">
        <LinkButton
          href={href || "#"}
          label={label || "Button preview"}
          linkStyle={s}
          primaryColor={primaryColor}
          accentColor={accentColor}
        />
      </div>

      <div>
        <p className="mb-1 text-[10px] font-semibold text-brand-muted">Thickness</p>
        <div className="flex flex-wrap gap-1">
          {(["thin", "medium", "thick"] as const).map((t) => (
            <Chip key={t} active={s.thickness === t} onClick={() => set({ thickness: t })}>
              {t}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 text-[10px] font-semibold text-brand-muted">Corners</p>
        <div className="flex flex-wrap gap-1">
          {(["sharp", "soft", "round", "pill"] as const).map((c) => (
            <Chip key={c} active={s.corners === c} onClick={() => set({ corners: c })}>
              {c}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 text-[10px] font-semibold text-brand-muted">Fill</p>
        <div className="flex flex-wrap gap-1">
          {(["solid", "gradient"] as const).map((f) => (
            <Chip key={f} active={s.fill === f} onClick={() => set({ fill: f })}>
              {f}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 text-[10px] font-semibold text-brand-muted">Fill color</p>
        <div className="flex flex-wrap items-center gap-1">
          {(["primary", "accent", "custom"] as const).map((m) => (
            <Chip key={m} active={(s.colorMode ?? "primary") === m} onClick={() => set({ colorMode: m })}>
              {m}
            </Chip>
          ))}
          {s.colorMode === "custom" && (
            <input
              type="color"
              value={s.customColor || primaryColor}
              onChange={(e) => set({ customColor: e.target.value })}
              className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
            />
          )}
          {s.fill === "gradient" && (
            <input
              type="color"
              title="Gradient end"
              value={s.gradientTo || accentColor}
              onChange={(e) => set({ gradientTo: e.target.value })}
              className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
            />
          )}
        </div>
      </div>

      <div>
        <p className="mb-1 text-[10px] font-semibold text-brand-muted">Border</p>
        <div className="flex flex-wrap gap-1">
          {(["none", "solid", "gradient"] as const).map((b) => (
            <Chip key={b} active={(s.borderMode ?? "none") === b} onClick={() => set({ borderMode: b })}>
              {b}
            </Chip>
          ))}
        </div>
        {s.borderMode !== "none" && (
          <div className="mt-2 space-y-2">
            <label className="flex items-center justify-between gap-2 text-[10px] text-brand-muted">
              Width
              <input
                type="range"
                min={1}
                max={4}
                step={0.5}
                value={s.borderWidth ?? 1.5}
                onChange={(e) => set({ borderWidth: Number(e.target.value) })}
                className="max-w-[9rem]"
              />
            </label>
            <div className="flex flex-wrap items-center gap-1">
              {(["primary", "accent", "custom"] as const).map((m) => (
                <Chip
                  key={m}
                  active={(s.borderColorMode ?? "primary") === m}
                  onClick={() => set({ borderColorMode: m })}
                >
                  {m}
                </Chip>
              ))}
              {s.borderColorMode === "custom" && (
                <input
                  type="color"
                  value={s.borderCustomColor || primaryColor}
                  onChange={(e) => set({ borderCustomColor: e.target.value })}
                  className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
                />
              )}
              {s.borderMode === "gradient" && (
                <input
                  type="color"
                  title="Border gradient end"
                  value={s.borderGradientTo || accentColor}
                  onChange={(e) => set({ borderGradientTo: e.target.value })}
                  className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
                />
              )}
            </div>
          </div>
        )}
      </div>

      <div>
        <p className="mb-1 text-[10px] font-semibold text-brand-muted">Icon (optional, right)</p>
        <div className="flex flex-wrap gap-1">
          <Chip active={(s.iconKind ?? "none") === "none"} onClick={() => set({ iconKind: "none" })}>
            None
          </Chip>
          <Chip active={s.iconKind === "icon"} onClick={() => set({ iconKind: "icon", iconName: s.iconName || "link" })}>
            2D icon
          </Chip>
          <Chip active={s.iconKind === "image"} onClick={() => set({ iconKind: "image" })}>
            Thumbnail
          </Chip>
        </div>
        {s.iconKind === "icon" && (
          <div className="mt-2 flex flex-wrap gap-1">
            {LINK_ICON_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                title={opt.label}
                onClick={() => set({ iconName: opt.id as LinkIconName, iconKind: "icon" })}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg border",
                  s.iconName === opt.id
                    ? "border-brand-purple/40 bg-brand-purple/10 text-brand-ink"
                    : "border-brand-ink/10 bg-brand-surface text-brand-muted",
                )}
              >
                <LinkGlyphIcon name={opt.id} size={16} />
              </button>
            ))}
          </div>
        )}
        {s.iconKind === "image" && (
          <label className="mt-2 block space-y-1">
            <span className="text-[10px] font-semibold text-brand-muted">Image URL</span>
            <input
              className="premium-input font-mono text-xs"
              value={s.iconUrl ?? ""}
              onChange={(e) => set({ iconUrl: e.target.value, iconKind: "image" })}
              placeholder="https://…/icon.png"
            />
          </label>
        )}
        <div className="mt-2 flex flex-wrap gap-1">
          <Chip active={(s.iconSide ?? "right") === "right"} onClick={() => set({ iconSide: "right" })}>
            Icon right
          </Chip>
          <Chip active={s.iconSide === "left"} onClick={() => set({ iconSide: "left" })}>
            Icon left
          </Chip>
        </div>
      </div>
    </div>
  );
}
