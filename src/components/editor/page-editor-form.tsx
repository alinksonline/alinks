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
  useSensor,
  useSensors,
  DragEndEvent,
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

  const updateBlock = (index: number, field: "title" | "body", value: string) => {
    setContent((prev) => {
      const blocks = [...(prev.blocks ?? [])];
      blocks[index] = { ...blocks[index], [field]: value };
      return { ...prev, blocks };
    });
  };

  const updateBlockFull = (id: string, updatedBlock: PageContent["blocks"][0]) => {
    setContent((prev) => {
      const blocks = [...(prev.blocks ?? [])];
      const index = blocks.findIndex((b) => b.id === id);
      if (index > -1) {
        blocks[index] = updatedBlock;
      }
      return { ...prev, blocks };
    });
  };

  const removeBlock = (id: string) => {
    setContent((prev) => ({
      ...prev,
      blocks: prev.blocks?.filter((b) => b.id !== id) ?? [],
    }));
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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
    <div className="space-y-6">
      {slug === "home" && content.hero && (
        <section className="space-y-3 rounded-xl border p-4">
          <h2 className="font-semibold">Hero</h2>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={content.hero.title}
            onChange={(e) => setContent({ ...content, hero: { ...content.hero!, title: e.target.value } })}
            placeholder="Hero title"
          />
          <textarea
            className="w-full rounded-lg border px-3 py-2"
            value={content.hero.tagline}
            onChange={(e) => setContent({ ...content, hero: { ...content.hero!, tagline: e.target.value } })}
            rows={2}
          />
        </section>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={content.blocks?.map((b) => b.id) ?? []}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
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
      
      {/* Slide-out Panel */}
      {selectedBlockId && content.blocks?.find((b) => b.id === selectedBlockId) && (
        <BlockEditorPanel 
          block={content.blocks.find((b) => b.id === selectedBlockId)!}
          onClose={() => setSelectedBlockId(null)}
          onChange={(b) => updateBlockFull(b.id, b)}
        />
      )}
      
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={save} disabled={isPending}>
          Save draft
        </Button>
        <Button type="button" variant="secondary" onClick={togglePublish} disabled={isPending}>
          {published ? "Unpublish page" : "Publish page"}
        </Button>
      </div>
    </div>
  );
}