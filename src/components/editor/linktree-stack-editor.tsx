"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import {
  publishPageAction,
  publishWebsiteAction,
  savePageContentAction,
} from "@/app/actions/business";
import { Button } from "@/components/ui/button";
import { BlockRenderer } from "@/components/tenant/block-renderer";
import { TenantThemedLayout } from "@/components/tenant/tenant-themed-layout";
import type { BlockType, PageBlock, PageContent, PageHero, ThemeConfig } from "@/core/types/page";
import type { BusinessProfile } from "@/core/types/business-profile";
import { cn } from "@/core/utils/cn";
import { createBlock, WIDGET_CATALOG } from "./widget-catalog";
import { WidgetTypeIcon } from "./widget-icons";
import { WidgetEditSheet } from "./widget-edit-sheet";
import { HeroEditSheet } from "./hero-edit-sheet";
import { resolveHeroPresentation } from "@/core/utils/hero-style";

function StackCard({
  block,
  primaryColor,
  accentColor,
  profile,
  handle,
  onEdit,
  onToggle,
  onRemove,
}: {
  block: PageBlock;
  primaryColor: string;
  accentColor?: string;
  profile?: BusinessProfile | null;
  handle?: string;
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
    zIndex: isDragging ? 20 : undefined,
    opacity: isDragging ? 0.95 : block.visible === false ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative">
      <div className="absolute -left-0.5 top-1/2 z-10 flex -translate-y-1/2 opacity-60">
        <button
          type="button"
          className="flex h-7 w-6 touch-none items-center justify-center rounded-md bg-white/95 text-[9px] leading-none text-slate-400 shadow-sm ring-1 ring-black/5 active:bg-slate-100"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </button>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="w-full pl-5 text-left active:scale-[0.99]"
      >
        <div className={cn("pointer-events-none", block.visible === false && "grayscale")}>
          <BlockRenderer
            block={{ ...block, visible: true }}
            primaryColor={primaryColor}
            accentColor={accentColor}
            profile={profile}
            handle={handle}
          />
        </div>
      </button>
      <div className="mt-0.5 flex items-center justify-end gap-0.5 px-0.5">
        <button
          type="button"
          onClick={onToggle}
          className="rounded-full px-2 py-0.5 text-[10px] font-medium text-slate-400 active:bg-white"
        >
          {block.visible === false ? "Hidden · show" : "Hide"}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full px-2 py-0.5 text-[10px] font-medium text-red-400 active:bg-red-50"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function HeroPreviewCard({
  hero,
  primaryColor,
  accentColor,
  onEdit,
}: {
  hero: PageHero;
  primaryColor: string;
  accentColor: string;
  onEdit: () => void;
}) {
  const p = resolveHeroPresentation(hero, primaryColor, accentColor);
  return (
    <button
      type="button"
      onClick={onEdit}
      className="mb-3 w-full overflow-hidden text-left active:scale-[0.99]"
      style={{ borderRadius: p.section.borderRadius ?? "1rem" }}
    >
      <div style={{ ...p.section, minHeight: "7.5rem" }}>
        {p.overlayLayer ? <div aria-hidden style={p.overlayLayer} /> : null}
        <div style={{ ...p.inner, padding: "2rem 0.75rem 0.75rem" }}>
          <span className="mb-1.5 inline-block rounded-full bg-white/15 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider backdrop-blur">
            Hero · tap to edit · {p.layout}
          </span>
          <p style={{ ...p.title, fontSize: "1rem" }}>{hero.title || "Your headline"}</p>
          <p style={{ ...p.tagline, fontSize: "0.7rem" }}>{hero.tagline || "Your tagline"}</p>
          {p.showCta ? (
            <span style={{ ...p.cta, marginTop: "0.5rem", minHeight: "1.75rem", fontSize: "0.7rem", width: "100%" }}>
              {hero.ctaText}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function AddWidgetSheet({ onPick, onClose }: { onPick: (t: BlockType) => void; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/45" onClick={onClose} aria-hidden />
      <div
        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[min(85dvh,100%)] w-full max-w-[var(--app-max-width)] overflow-y-auto rounded-t-3xl bg-white shadow-2xl"
        style={{ paddingBottom: "var(--safe-bottom)" }}
      >
        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 px-4 py-2.5 backdrop-blur">
          <div className="mx-auto mb-1.5 h-1 w-9 rounded-full bg-slate-200" />
          <h2 className="text-sm font-bold">Add to your stack</h2>
          <p className="text-[11px] text-slate-500">Tap a block — it appears on your page instantly</p>
        </div>
        <ul className="grid grid-cols-2 gap-2 p-3">
          {WIDGET_CATALOG.map((w) => (
            <li key={w.type}>
              <button
                type="button"
                className="flex h-full w-full flex-col items-start gap-1 rounded-xl border border-slate-100 bg-slate-50 px-2.5 py-2.5 text-left active:scale-[0.98] active:bg-white"
                onClick={() => onPick(w.type)}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700 ring-1 ring-slate-200">
                  <WidgetTypeIcon type={w.type} size={18} />
                </span>
                <span className="text-xs font-semibold text-slate-900">{w.label}</span>
                <span className="text-[10px] leading-snug text-slate-500">{w.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

/** Linktree-style live stack editor — looks like the public mobile page. */
export function LinktreeStackEditor({
  businessId,
  slug,
  handle,
  businessName,
  primaryColor,
  accentColor = "#7c3aed",
  theme = null,
  initialContent,
  isPublished,
  businessIsPublished = false,
  profile = null,
}: {
  businessId: string;
  slug: string;
  handle: string;
  businessName: string;
  primaryColor: string;
  accentColor?: string;
  /** Full theme so editor stack matches public themed widgets */
  theme?: ThemeConfig | Record<string, unknown> | null;
  initialContent: PageContent;
  /** This page’s draft/live flag */
  isPublished: boolean;
  /** Whole mini-site is public at /{handle} */
  businessIsPublished?: boolean;
  profile?: BusinessProfile | null;
}) {
  const router = useRouter();
  const [content, setContent] = useState<PageContent>(() => ({
    ...initialContent,
    blocks: Array.isArray(initialContent.blocks) ? initialContent.blocks : [],
  }));
  const [published, setPublished] = useState(isPublished);
  const [siteLive, setSiteLive] = useState(businessIsPublished);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [liveFlash, setLiveFlash] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [editId, setEditId] = useState<string | null>(null);
  const [editHero, setEditHero] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showGoLiveConfirm, setShowGoLiveConfirm] = useState(false);
  const [goLiveConfirm, setGoLiveConfirm] = useState(false);

  const blocks = content.blocks ?? [];
  const editing = useMemo(() => blocks.find((b) => b.id === editId) ?? null, [blocks, editId]);
  const displayName = profile?.businessName || businessName;

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
      setTimeout(() => setSavedFlash(false), 1600);
      router.refresh();
    });
  };

  /** Save draft, then make the whole site public (business + all pages). */
  const goLive = (confirmLegal: boolean) => {
    setError(null);
    startTransition(async () => {
      const saved = await savePageContentAction(businessId, slug, content);
      if (!saved.success) {
        setError(saved.error ?? "Save failed before publish");
        return;
      }
      const live = await publishWebsiteAction(businessId, confirmLegal);
      if (!live.success) {
        setError(live.error ?? "Could not publish website");
        return;
      }
      setSiteLive(true);
      setPublished(true);
      setShowGoLiveConfirm(false);
      setGoLiveConfirm(false);
      setLiveFlash(true);
      setTimeout(() => setLiveFlash(false), 2500);
      router.refresh();
    });
  };

  const togglePublish = () => {
    setError(null);
    // Site not public yet → full go-live flow (what users mean by “Publish”)
    if (!siteLive) {
      setShowGoLiveConfirm(true);
      return;
    }
    startTransition(async () => {
      const next = !published;
      // Always persist latest blocks before flipping page visibility
      const saved = await savePageContentAction(businessId, slug, content);
      if (!saved.success) {
        setError(saved.error ?? "Save failed before publish");
        return;
      }
      const result = await publishPageAction(businessId, slug, next);
      if (result.success) {
        setPublished(next);
        router.refresh();
        return;
      }
      if ("code" in result && result.code === "SITE_NOT_LIVE") {
        setSiteLive(false);
        setShowGoLiveConfirm(true);
        return;
      }
      setError(result.error ?? "Publish failed");
    });
  };

  const previewTheme: ThemeConfig = {
    mode: (theme as ThemeConfig | null)?.mode ?? "light",
    primaryColor,
    accentColor,
    fontFamily: (theme as ThemeConfig | null)?.fontFamily ?? "Inter",
    borderRadius: (theme as ThemeConfig | null)?.borderRadius ?? "12px",
  };

  return (
    <div className="pb-32">
      {/* Studio frame + themed stack (same tokens as public site so all widgets contrast correctly) */}
      <div className="lt-studio overflow-hidden rounded-2xl">
        <TenantThemedLayout theme={previewTheme} fallbackPrimary={primaryColor} className="!min-h-0 px-3 pb-5 pt-4">
        {/* Profile header — compact Linktree top */}
        <div className="mb-5 flex flex-col items-center px-1 pt-1 text-center">
          {profile?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.logoUrl}
              alt=""
              className="h-11 w-11 rounded-full object-cover shadow-sm ring-2"
              style={{ boxShadow: "0 0 0 2px var(--t-surface)" }}
            />
          ) : (
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold shadow-sm"
              style={{ backgroundColor: primaryColor, color: "var(--t-on-primary, #fff)" }}
            >
              {(displayName || "A").slice(0, 1).toUpperCase()}
            </div>
          )}
          <p className="mt-2 text-sm font-semibold" style={{ color: "var(--t-ink)" }}>
            @{handle}
          </p>
          <p className="mt-0.5 text-[11px]" style={{ color: "var(--t-muted)" }}>
            {displayName}
          </p>
          <p
            className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: "var(--t-muted)" }}
          >
            Editing · {slug}
            {!siteLive ? " · site draft" : published ? " · live" : " · page draft"}
          </p>
        </div>

        {!siteLive && (
          <p className="mb-3 rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2 text-center text-[11px] leading-snug text-amber-900">
            Your site is still private. Tap <strong>Publish</strong> to go live at{" "}
            <span className="font-mono">/{handle}</span>.
          </p>
        )}
        {siteLive && liveFlash && (
          <p className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-[11px] font-semibold text-emerald-800">
            Live at /{handle} ✓
          </p>
        )}

        {slug === "home" && content.hero && (
          <HeroPreviewCard
            hero={content.hero}
            primaryColor={primaryColor}
            accentColor={accentColor}
            onEdit={() => setEditHero(true)}
          />
        )}

        {slug === "contact" && (
          <p className="mb-3 px-1 text-center text-[11px] leading-snug text-slate-500">
            Contact details come from{" "}
            <Link href="/editor/business" className="font-semibold text-brand-purple underline">
              Business profile
            </Link>
          </p>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            {/* Gap between cards = breathing room; cards themselves stay compact */}
            <div className="space-y-3.5 px-0.5">
              {blocks.map((block) => (
                <StackCard
                  key={block.id}
                  block={block}
                  primaryColor={primaryColor}
                  accentColor={accentColor}
                  profile={profile}
                  handle={handle}
                  onEdit={() => setEditId(block.id)}
                  onToggle={() => updateBlock({ ...block, visible: block.visible === false ? true : false })}
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
          <p className="mt-3 rounded-xl border border-dashed border-slate-200 bg-white/60 px-4 py-8 text-center text-xs text-slate-400">
            Your stack is empty. Add your first block below.
          </p>
        )}

        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="mt-4 flex min-h-10 w-full items-center justify-center gap-2 text-xs font-semibold active:scale-[0.99]"
          style={{
            borderRadius: "var(--t-radius)",
            backgroundColor: "var(--t-surface)",
            color: "var(--t-ink)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
            border: "1px solid var(--t-border)",
          }}
        >
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full text-sm leading-none"
            style={{ backgroundColor: "var(--t-primary)", color: "var(--t-on-primary, #fff)" }}
          >
            +
          </span>
          Add block
        </button>
        </TenantThemedLayout>
      </div>

      {error && <p className="mt-2 px-1 text-xs text-red-600">{error}</p>}
      {savedFlash && (
        <p className="mt-2 px-1 text-center text-xs font-semibold text-emerald-600">Saved ✓</p>
      )}

      {editHero && content.hero && (
        <HeroEditSheet
          hero={content.hero}
          primaryColor={primaryColor}
          accentColor={accentColor}
          onChange={(h) => setContent((c) => ({ ...c, hero: h }))}
          onClose={() => setEditHero(false)}
        />
      )}
      {editing && (
        <WidgetEditSheet
          block={editing}
          profile={profile}
          primaryColor={primaryColor}
          accentColor={accentColor}
          onChange={updateBlock}
          onClose={() => setEditId(null)}
        />
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

      {showGoLiveConfirm && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/45"
            onClick={() => !isPending && setShowGoLiveConfirm(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[var(--app-max-width)] rounded-t-2xl bg-white px-4 pb-6 pt-3 shadow-2xl"
            style={{ paddingBottom: "calc(1rem + var(--safe-bottom))" }}
          >
            <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-slate-200" />
            <h2 className="text-sm font-bold text-slate-900">Go live at /{handle}</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              This makes your whole mini-site public — not just this page. You can unpublish later from
              settings if needed.
            </p>
            <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300"
                checked={goLiveConfirm}
                onChange={(e) => setGoLiveConfirm(e.target.checked)}
              />
              <span className="text-xs leading-snug text-slate-700">
                I confirm my Terms & Privacy on this site are accurate, and the independent-operator
                footer is shown.
              </span>
            </label>
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                className="min-h-10 flex-1 rounded-xl py-2 text-sm"
                disabled={isPending}
                onClick={() => setShowGoLiveConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="bronze"
                className="min-h-10 flex-1 rounded-xl py-2 text-sm"
                disabled={isPending || !goLiveConfirm}
                onClick={() => goLive(true)}
              >
                {isPending ? "Publishing…" : "Publish website"}
              </Button>
            </div>
          </div>
        </>
      )}

      <div className="editor-sticky-actions">
        <div className="flex gap-2">
          <Button
            type="button"
            className="min-h-10 flex-1 rounded-xl py-2 text-sm"
            onClick={save}
            disabled={isPending}
          >
            {isPending ? "Saving…" : "Save"}
          </Button>
          <Button
            type="button"
            variant={siteLive && published ? "secondary" : "bronze"}
            className="min-h-10 flex-1 rounded-xl py-2 text-sm"
            onClick={togglePublish}
            disabled={isPending}
          >
            {isPending
              ? "…"
              : !siteLive
                ? "Publish"
                : published
                  ? "Unpublish page"
                  : "Publish page"}
          </Button>
        </div>
      </div>
    </div>
  );
}
