"use client";

import { useState } from "react";
import Link from "next/link";
import type { PageBlock, ServiceItem } from "@/core/types/page";
import type { BusinessProfile } from "@/core/types/business-profile";
import { cn } from "@/core/utils/cn";
import { widgetLabel } from "./widget-catalog";
import { WidgetTypeIcon } from "./widget-icons";
import { LinkStyleEditor } from "./link-style-editor";
import { SectionLayoutEditor, SectionStylingEditor } from "./section-style-editor";

type EditTab = "content" | "styling" | "layout";

const TABS: { id: EditTab; label: string }[] = [
  { id: "content", label: "Content" },
  { id: "styling", label: "Styling" },
  { id: "layout", label: "Layout" },
];

/** Bottom sheet with Content · Styling · Layout tabs for every stack widget. */
export function WidgetEditSheet({
  block,
  profile,
  primaryColor,
  accentColor,
  onChange,
  onClose,
}: {
  block: PageBlock;
  profile?: BusinessProfile | null;
  primaryColor: string;
  accentColor: string;
  onChange: (b: PageBlock) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<EditTab>("content");
  const data = block.data ?? {};
  const setData = (patch: Partial<NonNullable<PageBlock["data"]>>) => {
    onChange({ ...block, data: { ...data, ...patch } });
  };
  const items: ServiceItem[] = data.items ?? [];
  const profileWa = profile?.whatsapp || profile?.phone || "";
  const usesProfileContact = block.type === "contact" || block.type === "whatsapp";
  const isLink = block.type === "link";
  const isCard = !isLink; // card widgets share sectionStyle

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/45" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[min(90dvh,100%)] w-full max-w-[var(--app-max-width)] flex-col rounded-t-2xl bg-white shadow-2xl dark:bg-[rgb(var(--color-brand-surface))]"
        style={{ paddingBottom: "var(--safe-bottom)" }}
      >
        <div className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-slate-200 dark:bg-white/15" />

        <div className="flex items-center justify-between px-4 py-2.5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-brand-ink">
            <WidgetTypeIcon type={block.type} size={18} className="text-brand-muted" />
            {widgetLabel(block.type)}
          </h2>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center text-lg text-brand-muted"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="mx-3 flex gap-0.5 rounded-xl bg-brand-mist/80 p-0.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-[11px] font-semibold transition",
                tab === t.id
                  ? "bg-brand-surface text-brand-ink shadow-sm"
                  : "text-brand-muted",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {tab === "content" && (
            <>
              {usesProfileContact && profile && (
                <div className="rounded-xl bg-emerald-500/10 px-3 py-2 text-[11px] leading-relaxed text-emerald-900 dark:text-emerald-100">
                  <strong>Uses Business profile</strong> when fields are empty.
                  <br />
                  {profile.phone || "—"} · WA {profileWa || "—"} · {profile.email || "—"}
                  <br />
                  <Link href="/editor/business" className="font-semibold underline">
                    Edit profile →
                  </Link>
                </div>
              )}

              {!isLink && (
                <label className="block space-y-1">
                  <span className="text-[11px] font-semibold text-brand-muted">Title</span>
                  <input
                    className="premium-input"
                    value={block.title}
                    onChange={(e) => onChange({ ...block, title: e.target.value })}
                  />
                </label>
              )}

              {(block.type === "text" ||
                block.type === "features" ||
                block.type === "legal" ||
                block.type === "cta" ||
                block.type === "whatsapp" ||
                block.type === "contact" ||
                block.type === "services" ||
                block.type === "gallery") && (
                <label className="block space-y-1">
                  <span className="text-[11px] font-semibold text-brand-muted">
                    {block.type === "features" ? "Highlights text" : "Description"}
                  </span>
                  <textarea
                    className="premium-input min-h-[5rem] resize-y"
                    value={block.body}
                    onChange={(e) => onChange({ ...block, body: e.target.value })}
                    rows={3}
                    placeholder={
                      block.type === "features"
                        ? "Quality · Trust · Local service"
                        : undefined
                    }
                  />
                </label>
              )}

              {(isLink || block.type === "cta") && (
                <>
                  <label className="block space-y-1">
                    <span className="text-[11px] font-semibold text-brand-muted">Button label</span>
                    <input
                      className="premium-input"
                      value={data.buttonLabel ?? ""}
                      onChange={(e) => setData({ buttonLabel: e.target.value })}
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[11px] font-semibold text-brand-muted">Link</span>
                    <input
                      className="premium-input font-mono text-sm"
                      value={data.href ?? ""}
                      onChange={(e) => setData({ href: e.target.value })}
                      placeholder="https://… or /contact"
                    />
                  </label>
                </>
              )}

              {block.type === "whatsapp" && (
                <>
                  <label className="block space-y-1">
                    <span className="text-[11px] font-semibold text-brand-muted">WhatsApp override</span>
                    <input
                      className="premium-input"
                      value={data.phone ?? ""}
                      onChange={(e) => setData({ phone: e.target.value })}
                      placeholder={profileWa || "From Business profile"}
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[11px] font-semibold text-brand-muted">Message</span>
                    <input
                      className="premium-input"
                      value={data.message ?? ""}
                      onChange={(e) => setData({ message: e.target.value })}
                    />
                  </label>
                </>
              )}

              {block.type === "contact" && (
                <>
                  <label className="block space-y-1">
                    <span className="text-[11px] font-semibold text-brand-muted">Phone override</span>
                    <input
                      className="premium-input"
                      value={data.phone ?? ""}
                      onChange={(e) => setData({ phone: e.target.value })}
                      placeholder={profile?.phone || "From profile"}
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[11px] font-semibold text-brand-muted">Email override</span>
                    <input
                      className="premium-input"
                      value={data.email ?? ""}
                      onChange={(e) => setData({ email: e.target.value })}
                      placeholder={profile?.email || "From profile"}
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[11px] font-semibold text-brand-muted">Address override</span>
                    <textarea
                      className="premium-input"
                      value={data.address ?? ""}
                      onChange={(e) => setData({ address: e.target.value })}
                      placeholder={profile?.address || "From profile"}
                      rows={2}
                    />
                  </label>
                </>
              )}

              {block.type === "hours" && (
                <label className="block space-y-1">
                  <span className="text-[11px] font-semibold text-brand-muted">Hours (one line each)</span>
                  <textarea
                    className="premium-input min-h-[7rem] font-mono text-sm"
                    value={(data.lines ?? []).join("\n")}
                    onChange={(e) => setData({ lines: e.target.value.split("\n") })}
                    rows={5}
                  />
                </label>
              )}

              {block.type === "gallery" && (
                <label className="block space-y-1">
                  <span className="text-[11px] font-semibold text-brand-muted">Image URLs (one per line)</span>
                  <textarea
                    className="premium-input min-h-[7rem] font-mono text-xs"
                    value={(data.images ?? []).map((i) => i.url).join("\n")}
                    onChange={(e) =>
                      setData({
                        images: e.target.value
                          .split("\n")
                          .map((u) => u.trim())
                          .filter(Boolean)
                          .slice(0, 6)
                          .map((url) => ({ url })),
                      })
                    }
                    rows={5}
                  />
                </label>
              )}

              {block.type === "services" && (
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="space-y-1.5 rounded-xl bg-brand-mist/60 p-2.5">
                      <input
                        className="premium-input"
                        placeholder="Name"
                        value={item.name}
                        onChange={(e) => {
                          const next = [...items];
                          next[idx] = { ...item, name: e.target.value };
                          setData({ items: next });
                        }}
                      />
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          className="premium-input"
                          placeholder="₹ price"
                          value={item.price ?? ""}
                          onChange={(e) => {
                            const next = [...items];
                            next[idx] = { ...item, price: e.target.value };
                            setData({ items: next });
                          }}
                        />
                        <input
                          className="premium-input"
                          placeholder="Duration"
                          value={item.duration ?? ""}
                          onChange={(e) => {
                            const next = [...items];
                            next[idx] = { ...item, duration: e.target.value };
                            setData({ items: next });
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        className="text-[11px] font-semibold text-red-500"
                        onClick={() => setData({ items: items.filter((_, i) => i !== idx) })}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="w-full rounded-xl border border-dashed border-brand-ink/20 py-2.5 text-xs font-bold text-brand-purple"
                    onClick={() =>
                      setData({ items: [...items, { name: "New service", price: "₹0", duration: "" }] })
                    }
                  >
                    + Add service
                  </button>
                </div>
              )}
            </>
          )}

          {tab === "styling" && (
            <>
              {isLink ? (
                <LinkStyleEditor
                  style={data.linkStyle}
                  label={data.buttonLabel || block.title || "Open link"}
                  href={data.href || "#"}
                  primaryColor={primaryColor}
                  accentColor={accentColor}
                  onChange={(linkStyle) => setData({ linkStyle })}
                />
              ) : (
                <SectionStylingEditor
                  style={data.sectionStyle}
                  onChange={(sectionStyle) => setData({ sectionStyle })}
                />
              )}
              {block.type === "whatsapp" && (
                <p className="text-[10px] text-brand-muted">
                  WhatsApp bar stays brand green for recognition. Use Layout for spacing and width.
                </p>
              )}
            </>
          )}

          {tab === "layout" && (
            <>
              {isLink ? (
                <div className="space-y-3">
                  <p className="text-[11px] leading-snug text-brand-muted">
                    Drag the handle on the canvas to reorder this button in the stack. Icon side is under{" "}
                    <strong>Styling</strong>.
                  </p>
                  <div>
                    <p className="mb-1 text-[10px] font-semibold text-brand-muted">Icon side</p>
                    <div className="flex gap-1">
                      {(["left", "right"] as const).map((side) => (
                        <button
                          key={side}
                          type="button"
                          className={cn(
                            "rounded-lg border px-2.5 py-1 text-[10px] font-semibold capitalize",
                            (data.linkStyle?.iconSide ?? "right") === side
                              ? "border-brand-purple/40 bg-brand-purple/10 text-brand-ink"
                              : "border-brand-ink/10 bg-brand-surface text-brand-muted",
                          )}
                          onClick={() =>
                            setData({
                              linkStyle: { ...data.linkStyle, iconSide: side },
                            })
                          }
                        >
                          {side}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : isCard ? (
                <SectionLayoutEditor
                  style={data.sectionStyle}
                  onChange={(sectionStyle) => setData({ sectionStyle })}
                />
              ) : null}
            </>
          )}
        </div>

        <div className="border-t border-brand-ink/8 px-4 py-2.5">
          <button type="button" className="premium-btn-bronze" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </>
  );
}
