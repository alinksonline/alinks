"use client";

import type { PageBlock } from "@/core/types/page";

/**
 * Mobile-first block editor: full-width bottom sheet (phone), not a desktop side drawer.
 */
export function BlockEditorPanel({
  block,
  onClose,
  onChange,
}: {
  block: PageBlock;
  onClose: () => void;
  onChange: (b: PageBlock) => void;
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Edit ${block.type} block`}
        className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[min(92dvh,100%)] w-full max-w-[var(--app-max-width)] flex-col rounded-t-3xl border border-brand-ink/10 bg-brand-surface shadow-device"
        style={{ paddingBottom: "var(--safe-bottom)" }}
      >
        <div className="flex shrink-0 justify-center pb-1 pt-3">
          <span className="h-1 w-10 rounded-full bg-brand-ink/15" aria-hidden />
        </div>

        <div className="flex items-center justify-between gap-3 border-b border-brand-ink/8 px-4 pb-3">
          <h2 className="min-w-0 truncate text-base font-bold capitalize text-brand-ink">
            Edit {block.type}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl font-light text-brand-ink/50 active:bg-brand-mist"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
              Section title
            </label>
            <input
              className="premium-input"
              value={block.title}
              onChange={(e) => onChange({ ...block, title: e.target.value })}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
              Description
            </label>
            <textarea
              className="premium-input min-h-[6.5rem] resize-y text-base leading-relaxed"
              value={block.body}
              onChange={(e) => onChange({ ...block, body: e.target.value })}
              rows={4}
            />
          </div>

          {block.type === "services" && (
            <div className="space-y-3 border-t border-brand-ink/8 pt-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-brand-ink">Service items</h3>
                <button
                  type="button"
                  className="min-h-11 rounded-xl px-3 text-sm font-semibold text-brand-purple active:bg-brand-purple/10"
                >
                  + Add
                </button>
              </div>
              <p className="text-xs leading-relaxed text-brand-ink/50">
                Service list editing is next — save title and description for now.
              </p>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-brand-ink/8 bg-brand-surface px-4 py-3">
          <button type="button" onClick={onClose} className="premium-btn-bronze">
            Done
          </button>
        </div>
      </div>
    </>
  );
}
