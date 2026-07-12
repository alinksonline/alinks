"use client";

import type { ReactNode } from "react";
import type { SectionStyle } from "@/core/types/section-style";
import { DEFAULT_SECTION_STYLE } from "@/core/types/section-style";
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

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-semibold text-brand-muted">{label}</p>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

/** Styling tab controls for card widgets. */
export function SectionStylingEditor({
  style,
  onChange,
}: {
  style?: SectionStyle;
  onChange: (next: SectionStyle) => void;
}) {
  const s: SectionStyle = { ...DEFAULT_SECTION_STYLE, ...style };
  const set = (patch: Partial<SectionStyle>) => onChange({ ...s, ...patch });

  return (
    <div className="space-y-3">
      <Group label="Fill">
        {(["solid", "soft", "outline", "transparent"] as const).map((f) => (
          <Chip key={f} active={s.fill === f} onClick={() => set({ fill: f })}>
            {f}
          </Chip>
        ))}
      </Group>
      {(s.fill === "solid" || s.fill === "soft") && (
        <Group label="Fill color">
          {(["surface", "primary", "accent", "custom"] as const).map((m) => (
            <Chip key={m} active={(s.fillColorMode ?? "surface") === m} onClick={() => set({ fillColorMode: m })}>
              {m}
            </Chip>
          ))}
          {s.fillColorMode === "custom" && (
            <input
              type="color"
              value={s.customFill || "#ffffff"}
              onChange={(e) => set({ customFill: e.target.value, fillColorMode: "custom" })}
              className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
            />
          )}
        </Group>
      )}
      <Group label="Corners">
        {(["sharp", "soft", "round", "pill"] as const).map((c) => (
          <Chip key={c} active={s.corners === c} onClick={() => set({ corners: c })}>
            {c}
          </Chip>
        ))}
      </Group>
      <Group label="Border">
        {(["none", "solid"] as const).map((b) => (
          <Chip key={b} active={(s.borderMode ?? "solid") === b} onClick={() => set({ borderMode: b })}>
            {b}
          </Chip>
        ))}
      </Group>
      {s.borderMode === "solid" && (
        <Group label="Border color">
          {(["ink", "primary", "accent", "custom"] as const).map((m) => (
            <Chip
              key={m}
              active={(s.borderColorMode ?? "ink") === m}
              onClick={() => set({ borderColorMode: m })}
            >
              {m}
            </Chip>
          ))}
          {s.borderColorMode === "custom" && (
            <input
              type="color"
              value={s.customBorderColor || "#0f172a"}
              onChange={(e) => set({ customBorderColor: e.target.value, borderColorMode: "custom" })}
              className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
            />
          )}
        </Group>
      )}
      <Group label="Title color">
        {(["ink", "primary", "accent", "custom"] as const).map((m) => (
          <Chip key={m} active={(s.titleColorMode ?? "ink") === m} onClick={() => set({ titleColorMode: m })}>
            {m}
          </Chip>
        ))}
        {s.titleColorMode === "custom" && (
          <input
            type="color"
            value={s.customTitleColor || "#0f172a"}
            onChange={(e) => set({ customTitleColor: e.target.value, titleColorMode: "custom" })}
            className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
          />
        )}
      </Group>
      <Group label="Body color">
        {(["muted", "ink", "custom"] as const).map((m) => (
          <Chip key={m} active={(s.bodyColorMode ?? "muted") === m} onClick={() => set({ bodyColorMode: m })}>
            {m}
          </Chip>
        ))}
        {s.bodyColorMode === "custom" && (
          <input
            type="color"
            value={s.customBodyColor || "#64748b"}
            onChange={(e) => set({ customBodyColor: e.target.value, bodyColorMode: "custom" })}
            className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
          />
        )}
      </Group>
    </div>
  );
}
