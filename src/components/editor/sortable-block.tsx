"use client";

import React from "react";
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

export function SortableBlock({ id, block, index, onEdit, removeBlock }: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <section ref={setNodeRef} style={style} className="space-y-2 rounded-xl border p-4 bg-white shadow-sm flex gap-2">
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-grab active:cursor-grabbing pt-2 text-gray-400 hover:text-gray-700"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4zm2 6a2 2 0 11-4 0 2 2 0 014 0zm6-14a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4zm2 6a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0 py-2">
        <h3 className="font-semibold text-gray-900 truncate">{block.title || `Unnamed ${block.type} block`}</h3>
        <p className="text-sm text-gray-500 truncate">{block.body || "No content added yet"}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onEdit(block.id)}
          className="text-sm font-medium text-[var(--theme-primary)] hover:underline px-2 py-1"
        >
          Edit
        </button>
        <button 
          type="button" 
          onClick={() => removeBlock(block.id)}
          className="text-gray-400 hover:text-red-600 font-bold px-2 py-1"
          aria-label="Remove block"
        >
          &times;
        </button>
      </div>
    </section>
  );
}
