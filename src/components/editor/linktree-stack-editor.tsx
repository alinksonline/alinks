"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { publishPageAction, savePageContentAction } from "@/app/actions/business";
import { Button } from "@/components/ui/button";
import { BlockRenderer } from "@/components/tenant/block-renderer";
import type { BlockType, PageBlock, PageContent, ServiceItem } from "@/core/types/page";
import { cn } from "@/core/utils/cn";
import { createBlock, WIDGET_CATALOG, widgetLabel } from "./widget-catalog";

function StackCard({
  block,
  primaryColor,
  onEdit,
  onToggle,
  onRemove,
}: {
  block: PageBlock;
  primaryColor: string;
  onEdit: () => void;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : block.visible === false ? 0.45 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-stretch gap-1">
      <button
        type="button"
        className="flex w-9 shrink-0 touch-none items-center justify-center rounded-xl text-brand-ink/30 active:bg-brand-mist"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <button
        type="button"
        onClick={onEdit}
        className="min-w-0 flex-1 overflow-hidden rounded-2xl text-left active:scale-[0.99]"
      >
        <div className={cn(block.visible === false && "grayscale")}>
          <BlockRenderer block={{ ...block, visible: true }} primaryColor={primaryColor} />
        </div>
        <p className="mt-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-brand-ink/40">
          {widgetLabel(block.type)}
          {block.visible === false ? " · hidden" : ""} · tap to edit
        </p>
      </button>
      <div className="flex w-10 shrink-0 flex-col gap-1 py-1">
        <button
          type="button"
          onClick={onToggle}
          className="flex h-9 items-center justify-center rounded-lg text-xs font-bold text-brand-ink/50 active:bg-brand-mist"
          aria-label={block.visible === false ? "Show" : "Hide"}
          title={block.visible === false ? "Show on site" : "Hide on site"}
        >
          {block.visible === false ? "👁" : "◉"}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="flex h-9 items-center justify-center rounded-lg text-lg text-brand-ink/30 active:bg-red-50 active:text-red-600"
          aria-label="Remove"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function EditSheet({
  block,
  onChange,
  onClose,
}: {
  block: PageBlock;
  onChange: (b: PageBlock) => void;
  onClose: () => void;
}) {
  const data = block.data ?? {};

  const setData = (patch: Partial<NonNullable<PageBlock["data"]>>) => {
    onChange({ ...block, data: { ...data, ...patch } });
  };

  const items: ServiceItem[] = data.items ?? [];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[min(90dvh,100%)] w-full max-w-[var(--app-max-width)] flex-col rounded-t-3xl border border-brand-ink/10 bg-brand-surface shadow-device"
        style={{ paddingBottom: "var(--safe-bottom)" }}
      >
        <div className="flex justify-center pt-3">
          <span className="h-1 w-10 rounded-full bg-brand-ink/15" />
        </div>
        <div className="flex items-center justify-between px-4 pb-2 pt-2">
          <h2 className="text-base font-bold text-brand-ink">{widgetLabel(block.type)}</h2>
          <button type="button" className="flex h-11 w-11 items-center justify-center text-2xl text-brand-ink/40" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-4">
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase text-brand-ink/45">Title</span>
            <input className="premium-input" value={block.title} onChange={(e) => onChange({ ...block, title: e.target.value })} />
          </label>

          {(block.type === "text" ||
            block.type === "features" ||
            block.type === "legal" ||
            block.type === "cta" ||
            block.type === "whatsapp" ||
            block.type === "contact" ||
            block.type === "services" ||
            block.type === "gallery") && (
            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase text-brand-ink/45">Subtitle / body</span>
              <textarea
                className="premium-input min-h-[5rem] resize-y"
                value={block.body}
                onChange={(e) => onChange({ ...block, body: e.target.value })}
                rows={3}
              />
            </label>
          )}

          {(block.type === "link" || block.type === "cta") && (
            <>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase text-brand-ink/45">Button label</span>
                <input
                  className="premium-input"
                  value={data.buttonLabel ?? ""}
                  onChange={(e) => setData({ buttonLabel: e.target.value })}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase text-brand-ink/45">Link URL</span>
                <input
                  className="premium-input font-mono text-sm"
                  value={data.href ?? ""}
                  onChange={(e) => setData({ href: e.target.value })}
                  placeholder="https://… or /contact"
                  inputMode="url"
                />
              </label>
            </>
          )}

          {block.type === "whatsapp" && (
            <>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase text-brand-ink/45">WhatsApp number</span>
                <input
                  className="premium-input"
                  value={data.phone ?? ""}
                  onChange={(e) => setData({ phone: e.target.value })}
                  placeholder="919876543210"
                  inputMode="tel"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase text-brand-ink/45">Pre-filled message</span>
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
                <span className="text-xs font-semibold uppercase text-brand-ink/45">Phone</span>
                <input className="premium-input" value={data.phone ?? ""} onChange={(e) => setData({ phone: e.target.value })} inputMode="tel" />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase text-brand-ink/45">Email</span>
                <input className="premium-input" value={data.email ?? ""} onChange={(e) => setData({ email: e.target.value })} inputMode="email" />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase text-brand-ink/45">Address</span>
                <textarea className="premium-input" value={data.address ?? ""} onChange={(e) => setData({ address: e.target.value })} rows={2} />
              </label>
            </>
          )}

          {block.type === "hours" && (
            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase text-brand-ink/45">Hours (one line each)</span>
              <textarea
                className="premium-input min-h-[7rem] font-mono text-sm"
                value={(data.lines ?? []).join("\n")}
                onChange={(e) =>
                  setData({
                    lines: e.target.value.split("\n"),
                  })
                }
                rows={5}
                placeholder={"Mon–Sat: 10am–8pm\nSunday: Closed"}
              />
            </label>
          )}

          {block.type === "gallery" && (
            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase text-brand-ink/45">Image URLs (one per line, max 6)</span>
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
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase text-brand-ink/45">Service items</p>
              {items.map((item, idx) => (
                <div key={idx} className="space-y-2 rounded-xl border border-brand-ink/10 p-3">
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
                  <div className="grid grid-cols-2 gap-2">
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
                    className="text-xs font-semibold text-red-600"
                    onClick={() => setData({ items: items.filter((_, i) => i !== idx) })}
                  >
                    Remove item
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="w-full rounded-xl border border-dashed border-brand-ink/20 py-3 text-sm font-semibold text-brand-purple"
                onClick={() => setData({ items: [...items, { name: "New service", price: "₹0", duration: "" }] })}
              >
                + Add service
              </button>
            </div>
          )}
        </div>
        <div className="border-t border-brand-ink/8 px-4 py-3">
          <button type="button" className="premium-btn-bronze" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </>
  );
}

function AddWidgetSheet({ onPick, onClose }: { onPick: (t: BlockType) => void; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} aria-hidden />
      <div
        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[min(85dvh,100%)] w-full max-w-[var(--app-max-width)] overflow-y-auto rounded-t-3xl border border-brand-ink/10 bg-brand-surface shadow-device"
        style={{ paddingBottom: "var(--safe-bottom)" }}
      >
        <div className="sticky top-0 border-b border-brand-ink/8 bg-brand-surface px-4 py-3">
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-brand-ink/15" />
          <h2 className="text-base font-bold">Add section</h2>
          <p className="text-xs text-brand-ink/45">Mobile widgets only — stacked like Linktree</p>
        </div>
        <ul className="divide-y divide-brand-ink/6 p-2">
          {WIDGET_CATALOG.map((w) => (
            <li key={w.type}>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left active:bg-brand-mist"
                onClick={() => onPick(w.type)}
              >
                <span className="text-xl">{w.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-brand-ink">{w.label}</span>
                  <span className="block text-xs text-brand-ink/50">{w.hint}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export function LinktreeStackEditor({
  businessId,
  slug,
  handle,
  businessName,
  primaryColor,
  initialContent,
  isPublished,
}: {
  businessId: string;
  slug: string;
  handle: string;
  businessName: string;
  primaryColor: string;
  initialContent: PageContent;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [content, setContent] = useState<PageContent>(() => ({
    ...initialContent,
    blocks: Array.isArray(initialContent.blocks) ? initialContent.blocks : [],
  }));
  const [published, setPublished] = useState(isPublished);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [editId, setEditId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const blocks = content.blocks ?? [];
  const editing = useMemo(() => blocks.find((b) => b.id === editId) ?? null, [blocks, editId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 160, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const updateBlock = (next: PageBlock) => {
    setContent((prev) => ({
      ...prev,
      blocks: (prev.blocks ?? []).map((b) => (b.id === next.id ? next : b)),
    }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setContent((prev) => {
      const list = [...(prev.blocks ?? [])];
      const oldIndex = list.findIndex((b) => b.id === active.id);
      const newIndex = list.findIndex((b) => b.id === over.id);
      return { ...prev, blocks: arrayMove(list, oldIndex, newIndex) };
    });
  };

  const save = () => {
    setError(null);
    startTransition(async () => {
      const result = await savePageContentAction(businessId, slug, content);
      if (!result.success) {
        setError(result.error ?? "Save failed");
        return;
      }
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
      router.refresh();
    });
  };

  const togglePublish = () => {
    startTransition(async () => {
      const next = !published;
      const result = await publishPageAction(businessId, slug, next);
      if (result.success) {
        setPublished(next);
        router.refresh();
      } else setError(result.error ?? "Publish failed");
    });
  };

  return (
    <div className="pb-32">
      {/* Live phone stack preview header */}
      <div className="mb-3 rounded-2xl border border-brand-ink/8 bg-brand-ink px-4 py-3 text-brand-cream">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-cream/50">Live stack · {slug}</p>
        <p className="truncate text-sm font-bold">{businessName}</p>
        <p className="text-xs text-brand-cream/55">/{handle}</p>
      </div>

      {slug === "home" && content.hero && (
        <section className="mb-3 space-y-2 rounded-2xl border border-brand-ink/10 bg-brand-surface p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-brand-ink/40">Hero (home only)</p>
          <input
            className="premium-input"
            value={content.hero.title}
            onChange={(e) => setContent({ ...content, hero: { ...content.hero!, title: e.target.value } })}
            placeholder="Hero title"
          />
          <textarea
            className="premium-input min-h-[3.5rem]"
            value={content.hero.tagline}
            onChange={(e) => setContent({ ...content, hero: { ...content.hero!, tagline: e.target.value } })}
            rows={2}
            placeholder="Tagline"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              className="premium-input text-sm"
              value={content.hero.ctaText}
              onChange={(e) => setContent({ ...content, hero: { ...content.hero!, ctaText: e.target.value } })}
              placeholder="Button text"
            />
            <input
              className="premium-input font-mono text-xs"
              value={content.hero.ctaLink}
              onChange={(e) => setContent({ ...content, hero: { ...content.hero!, ctaLink: e.target.value } })}
              placeholder="/contact"
            />
          </div>
        </section>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {blocks.map((block) => (
              <StackCard
                key={block.id}
                block={block}
                primaryColor={primaryColor}
                onEdit={() => setEditId(block.id)}
                onToggle={() =>
                  updateBlock({ ...block, visible: block.visible === false ? true : false })
                }
                onRemove={() => {
                  setContent((prev) => ({
                    ...prev,
                    blocks: (prev.blocks ?? []).filter((b) => b.id !== block.id),
                  }));
                  if (editId === block.id) setEditId(null);
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {!blocks.length && (
        <p className="rounded-2xl border border-dashed border-brand-ink/15 px-4 py-8 text-center text-sm text-brand-ink/45">
          No sections yet. Tap + Add section to build this page.
        </p>
      )}

      <button
        type="button"
        onClick={() => setShowAdd(true)}
        className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-purple/30 bg-brand-purple/5 text-sm font-bold text-brand-purple active:scale-[0.99]"
      >
        + Add section
      </button>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {savedFlash && <p className="mt-3 text-sm font-medium text-emerald-600">Saved</p>}

      {editing && (
        <EditSheet block={editing} onChange={updateBlock} onClose={() => setEditId(null)} />
      )}
      {showAdd && (
        <AddWidgetSheet
          onClose={() => setShowAdd(false)}
          onPick={(type) => {
            setContent((prev) => ({
              ...prev,
              blocks: [...(prev.blocks ?? []), createBlock(type)],
            }));
            setShowAdd(false);
          }}
        />
      )}

      <div className="editor-sticky-actions">
        <div className="flex gap-2">
          <Button type="button" className="min-h-12 flex-1" onClick={save} disabled={isPending}>
            {isPending ? "Saving…" : "Save"}
          </Button>
          <Button type="button" variant="secondary" className="min-h-12 flex-1" onClick={togglePublish} disabled={isPending}>
            {published ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </div>
    </div>
  );
}
