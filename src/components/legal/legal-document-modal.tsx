"use client";

import Link from "next/link";
import { useCallback, useEffect, useId } from "react";
import { Button } from "@/components/ui/button";
import { LegalDocumentBody } from "@/components/legal/legal-document-body";
import type { PlatformLegalDocument } from "@/platform/legal/platform-documents";
import { cn } from "@/core/utils/cn";

type LegalDocumentModalProps = {
  legalDocument: PlatformLegalDocument;
  open: boolean;
  onClose: () => void;
};

export function LegalDocumentModal({ legalDocument, open, onClose }: LegalDocumentModalProps) {
  const titleId = useId();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close document"
        className="absolute inset-0 bg-brand-ink/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative z-[101] flex max-h-[min(92vh,720px)] w-full max-w-app flex-col",
          "rounded-t-2xl border border-brand-ink/10 bg-brand-surface shadow-2xl sm:rounded-2xl",
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-brand-ink/8 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p id={titleId} className="truncate text-sm font-semibold text-brand-ink">
              {legalDocument.title}
            </p>
            <p className="text-[11px] text-brand-ink/45">Scroll to read the full document</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-brand-ink/50 hover:bg-brand-mist hover:text-brand-ink"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          <LegalDocumentBody document={legalDocument} compact />
        </div>

        <div className="flex gap-2 border-t border-brand-ink/8 p-4 sm:px-5">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <Link href={legalDocument.slug} className="flex-1" onClick={onClose}>
            <Button type="button" variant="bronze" className="w-full">
              Open full page
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}