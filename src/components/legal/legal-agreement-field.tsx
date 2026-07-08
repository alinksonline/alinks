"use client";

import Link from "next/link";
import { useState } from "react";
import { LegalDocumentModal } from "@/components/legal/legal-document-modal";
import { getPlatformLegalDocument, type PlatformLegalDocument } from "@/platform/legal/platform-documents";

type LegalAgreementFieldProps = {
  docId: PlatformLegalDocument["id"];
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function LegalAgreementField({ docId, checked, onChange }: LegalAgreementFieldProps) {
  const [open, setOpen] = useState(false);
  const document = getPlatformLegalDocument(docId);

  return (
    <>
      <label className="flex gap-2.5 text-sm leading-snug text-brand-ink/80">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 shrink-0"
        />
        <span>
          I agree to the{" "}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="font-semibold text-brand-purple underline decoration-brand-purple/30 underline-offset-2 hover:decoration-brand-purple"
          >
            {document.checkboxLabel}
          </button>
          <span className="mt-1 block text-[11px] text-brand-ink/45">
            <button type="button" onClick={() => setOpen(true)} className="font-medium text-brand-purple/80 hover:text-brand-purple">
              Read in popup
            </button>
            <span aria-hidden="true"> · </span>
            <Link href={document.slug} className="font-medium text-brand-purple/80 hover:text-brand-purple">
              View full page
            </Link>
          </span>
        </span>
      </label>

      <LegalDocumentModal legalDocument={document} open={open} onClose={() => setOpen(false)} />
    </>
  );
}