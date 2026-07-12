"use client";

import type { ReactNode } from "react";
import type { GradientStop, MediaOverlay } from "@/core/types/media-bg";
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

/** Overlay: none · solid (+ opacity) · gradient (per-stop color + opacity + position). */
export function OverlayEditor({
  value,
  onChange,
  label = "Overlay",
}: {
  value?: MediaOverlay | null;
  onChange: (next: MediaOverlay) => void;
  label?: string;
}) {
  const v: MediaOverlay = value ?? { kind: "none" };

  return (
    <div className="space-y-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">{label}</p>
      <div className="flex flex-wrap gap-1">
        {(["none", "solid", "gradient"] as const).map((k) => (
          <Chip
            key={k}
            active={v.kind === k}
            onClick={() => {
              if (k === "none") onChange({ kind: "none" });
              else if (k === "solid")
                onChange({ kind: "solid", color: "#000000", opacity: 0.45 });
              else
                onChange({
                  kind: "gradient",
                  angle: 180,
                  stops: [
                    { color: "#000000", opacity: 0.75, at: 0 },
                    { color: "#000000", opacity: 0.2, at: 100 },
                  ],
                });
            }}
          >
            {k}
          </Chip>
        ))}
      </div>

      {v.kind === "solid" && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-ink/10 p-2.5">
          <input
            type="color"
            value={v.color}
            onChange={(e) => onChange({ ...v, color: e.target.value })}
            className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
          />
          <label className="flex flex-1 flex-col gap-0.5 text-[10px] text-brand-muted">
            Opacity {Math.round(v.opacity * 100)}%
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={v.opacity}
              onChange={(e) => onChange({ ...v, opacity: Number(e.target.value) })}
            />
          </label>
        </div>
      )}

      {v.kind === "gradient" && (
        <div className="space-y-2 rounded-xl border border-brand-ink/10 p-2.5">
          <label className="flex flex-col gap-0.5 text-[10px] text-brand-muted">
            Angle {v.angle}°
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={v.angle}
              onChange={(e) => onChange({ ...v, angle: Number(e.target.value) })}
            />
          </label>
          {v.stops.map((stop, i) => (
            <GradientStopRow
              key={i}
              stop={stop}
              onChange={(next) => {
                const stops = [...v.stops];
                stops[i] = next;
                onChange({ ...v, stops });
              }}
              onRemove={
                v.stops.length > 2
                  ? () => onChange({ ...v, stops: v.stops.filter((_, j) => j !== i) })
                  : undefined
              }
            />
          ))}
          {v.stops.length < 5 && (
            <button
              type="button"
              className="text-[11px] font-semibold text-brand-purple"
              onClick={() =>
                onChange({
                  ...v,
                  stops: [...v.stops, { color: "#000000", opacity: 0.4, at: 50 }],
                })
              }
            >
              + Add color stop
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function GradientStopRow({
  stop,
  onChange,
  onRemove,
}: {
  stop: GradientStop;
  onChange: (s: GradientStop) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="space-y-1 rounded-lg bg-brand-mist/50 p-2">
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={stop.color}
          onChange={(e) => onChange({ ...stop, color: e.target.value })}
          className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <span className="text-[10px] font-semibold text-brand-ink">Stop</span>
        {onRemove && (
          <button type="button" className="ml-auto text-[10px] font-semibold text-red-500" onClick={onRemove}>
            Remove
          </button>
        )}
      </div>
      <label className="flex flex-col gap-0.5 text-[10px] text-brand-muted">
        Node opacity {Math.round(stop.opacity * 100)}%
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={stop.opacity}
          onChange={(e) => onChange({ ...stop, opacity: Number(e.target.value) })}
        />
      </label>
      <label className="flex flex-col gap-0.5 text-[10px] text-brand-muted">
        Position {stop.at}%
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={stop.at}
          onChange={(e) => onChange({ ...stop, at: Number(e.target.value) })}
        />
      </label>
    </div>
  );
}

/** Background: none · image URL (via parent) · solid · gradient with per-node opacity. */
export function BackgroundKindEditor({
  kind,
  onKind,
  solidColor,
  solidOpacity,
  onSolid,
  gradientAngle,
  gradientStops,
  onGradient,
}: {
  kind: "none" | "image" | "solid" | "gradient";
  onKind: (k: "none" | "image" | "solid" | "gradient") => void;
  solidColor: string;
  solidOpacity: number;
  onSolid: (color: string, opacity: number) => void;
  gradientAngle: number;
  gradientStops: GradientStop[];
  onGradient: (angle: number, stops: GradientStop[]) => void;
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">Background</p>
      <div className="flex flex-wrap gap-1">
        {(["none", "image", "solid", "gradient"] as const).map((k) => (
          <Chip key={k} active={kind === k} onClick={() => onKind(k)}>
            {k}
          </Chip>
        ))}
      </div>
      {kind === "solid" && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-ink/10 p-2.5">
          <input
            type="color"
            value={solidColor}
            onChange={(e) => onSolid(e.target.value, solidOpacity)}
            className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
          />
          <label className="flex flex-1 flex-col gap-0.5 text-[10px] text-brand-muted">
            Opacity {Math.round(solidOpacity * 100)}%
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={solidOpacity}
              onChange={(e) => onSolid(solidColor, Number(e.target.value))}
            />
          </label>
        </div>
      )}
      {kind === "gradient" && (
        <OverlayEditor
          value={{ kind: "gradient", angle: gradientAngle, stops: gradientStops }}
          onChange={(o) => {
            if (o.kind === "gradient") onGradient(o.angle, o.stops);
          }}
          label="Background gradient"
        />
      )}
    </div>
  );
}
