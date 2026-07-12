"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PageBlock } from "@/core/types/page";

interface SortableBlockProps {
  id: string;
  block: PageBlock;
  index: number;
  onEdit: (id: string) => void;
  removeBlock: (id: string) => void;
}

/** Mobile-first block card — large tap targets, drag handle separate from edit. */
export function SortableBlock({ id, block, onEdit, removeBlock }: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.92 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <section
      ref={setNodeRef}
      style={style}
      className="flex items-stretch gap-1 rounded-2xl border border-brand-ink/10 bg-brand-surface p-2 shadow-card"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex w-11 shrink-0 touch-none items-center justify-center rounded-xl text-brand-ink/35 active:bg-brand-mist active:text-brand-ink/70"
        aria-label="Drag to reorder"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M8 5a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4zm2 6a2 2 0 11-4 0 2 2 0 014 0zm6-14a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4zm2 6a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => onEdit(block.id)}
        className="min-w-0 flex-1 rounded-xl px-2 py-3 text-left active:bg-brand-mist/80"
      >
        <p className="truncate text-sm font-semibold text-brand-ink">
          {block.title || `Unnamed ${block.type}`}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-brand-ink/50">
          {block.body || "Tap to edit content"}
        </p>
        <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand-purple/80">
          {block.type}
        </p>
      </button>

      <button
        type="button"
        onClick={() => removeBlock(block.id)}
        className="flex w-11 shrink-0 items-center justify-center rounded-xl text-xl text-brand-ink/30 active:bg-red-50 active:text-red-600"
        aria-label="Remove block"
      >
        &times;
      </button>
    </section>
  );
}
