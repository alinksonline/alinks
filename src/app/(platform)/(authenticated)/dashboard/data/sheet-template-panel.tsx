import { sheetTemplateForIndustry } from "@/tenant/storage/industry-sheets";
import { SHEET_HEADERS } from "@/tenant/storage/sheet-tabs";

/** C2 — shows which workbook tabs this industry will get. */
export function SheetTemplatePanel({
  industryGroup,
  industryType,
}: {
  industryGroup: string;
  industryType: string;
}) {
  const lines = sheetTemplateForIndustry(industryGroup, industryType);

  return (
    <section className="rounded-2xl border border-brand-ink/10 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
        Sheet template · your industry
      </p>
      <p className="mt-1 text-sm text-brand-muted">
        When you create or reconnect a Google Sheet, ALINKS provisions these tabs with header rows.
        Customer data never lives in the ALINKS platform database.
      </p>
      <ul className="mt-3 space-y-2">
        {lines.map((line) => (
          <li key={line.tab} className="rounded-xl border border-brand-ink/8 bg-stone-50 px-3 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-brand-ink">{line.tab}</span>
              {line.primary ? (
                <span className="rounded-full bg-brand-turquoise/15 px-2 py-0.5 font-mono text-[9px] text-emerald-800">
                  primary
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 text-xs text-brand-muted">{line.purpose}</p>
            <p className="mt-1 font-mono text-[10px] text-stone-400">
              {SHEET_HEADERS[line.tab].slice(0, 6).join(" · ")}
              {SHEET_HEADERS[line.tab].length > 6 ? " · …" : ""}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
