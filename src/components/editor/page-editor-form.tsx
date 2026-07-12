"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { publishPageAction, savePageContentAction } from "@/app/actions/business";
import type { PageContent } from "@/core/types/page";
import { Button } from "@/components/ui/button";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableBlock } from "./sortable-block";
import { BlockEditorPanel } from "./block-editor-panel";

export function PageEditorForm({
  businessId,
  slug,
  initialContent,
  isPublished,
}: {
  businessId: string;
  slug: string;
  initialContent: PageContent;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [content, setContent] = useState<PageContent>(initialContent);
  const [published, setPublished] = useState(isPublished);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const updateBlockFull = (id: string, updatedBlock: PageContent["blocks"][0]) => {
    setContent((prev) => {
      const blocks = [...(prev.blocks ?? [])];
      const index = blocks.findIndex((b) => b.id === id);
      if (index > -1) blocks[index] = updatedBlock;
      return { ...prev, blocks };
    });
  };

  const removeBlock = (id: string) => {
    setContent((prev) => ({
      ...prev,
      blocks: prev.blocks?.filter((b) => b.id !== id) ?? [],
    }));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setContent((prev) => {
        const blocks = [...(prev.blocks ?? [])];
        const oldIndex = blocks.findIndex((b) => b.id === active.id);
        const newIndex = blocks.findIndex((b) => b.id === over.id);
        return { ...prev, blocks: arrayMove(blocks, oldIndex, newIndex) };
      });
    }
  };

  const save = () => {
    setError(null);
    startTransition(async () => {
      const result = await savePageContentAction(businessId, slug, content);
      if (!result.success) setError(result.error ?? "Save failed");
      else router.refresh();
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
    <div className="space-y-4 pb-28">
      {slug === "home" && content.hero && (
        <section className="space-y-3 rounded-2xl border border-brand-ink/10 bg-brand-surface p-4 shadow-card">
          <h2 className="text-sm font-bold text-brand-ink">Hero (top of home)</h2>
          <input
            className="premium-input"
            value={content.hero.title}
            onChange={(e) =>
              setContent({ ...content, hero: { ...content.hero!, title: e.target.value } })
            }
            placeholder="Hero title"
            autoComplete="off"
          />
          <textarea
            className="premium-input min-h-[4.5rem] resize-y text-base"
            value={content.hero.tagline}
            onChange={(e) =>
              setContent({ ...content, hero: { ...content.hero!, tagline: e.target.value } })
            }
            rows={2}
            placeholder="Tagline"
          />
        </section>
      )}

      <p className="text-xs text-brand-ink/45">Hold the ⋮⋮ handle to reorder · tap a card to edit</p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={content.blocks?.map((b) => b.id) ?? []}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {content.blocks?.map((block, i) => (
              <SortableBlock
                key={block.id}
                id={block.id}
                block={block}
                index={i}
                onEdit={setSelectedBlockId}
                removeBlock={removeBlock}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {selectedBlockId && content.blocks?.find((b) => b.id === selectedBlockId) && (
        <BlockEditorPanel
          block={content.blocks.find((b) => b.id === selectedBlockId)!}
          onClose={() => setSelectedBlockId(null)}
          onChange={(b) => updateBlockFull(b.id, b)}
        />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Sticky bottom actions above platform tab bar */}
      <div className="editor-sticky-actions">
        <div className="flex gap-2">
          <Button type="button" className="min-h-12 flex-1" onClick={save} disabled={isPending}>
            {isPending ? "Saving…" : "Save draft"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="min-h-12 flex-1"
            onClick={togglePublish}
            disabled={isPending}
          >
            {published ? "Unpublish" : "Publish page"}
          </Button>
        </div>
      </div>
    </div>
  );
}
