import type { PlatformLegalDocument } from "@/platform/legal/platform-documents";
import { cn } from "@/core/utils/cn";

type LegalDocumentBodyProps = {
  document: PlatformLegalDocument;
  className?: string;
  compact?: boolean;
};

export function LegalDocumentBody({ document, className, compact }: LegalDocumentBodyProps) {
  return (
    <article className={cn("text-brand-ink/85", className)}>
      <header className={cn("border-b border-brand-ink/8", compact ? "pb-4" : "pb-6")}>
        <p className="font-mono text-[10px] uppercase tracking-wider text-brand-purple">Legal · Draft</p>
        <h1 className={cn("font-bold text-brand-ink", compact ? "mt-2 text-lg" : "mt-3 text-2xl")}>
          {document.title}
        </h1>
        <p className={cn("text-brand-ink/60", compact ? "mt-2 text-xs" : "mt-3 text-sm")}>{document.subtitle}</p>
        <ul className={cn("space-y-1 text-brand-ink/45", compact ? "mt-3 text-[11px]" : "mt-4 text-xs")}>
          {document.meta.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p
          className={cn(
            "rounded-xl border border-amber-500/25 bg-amber-500/8 text-amber-900 dark:text-amber-100/90",
            compact ? "mt-4 p-3 text-[11px] leading-relaxed" : "mt-5 p-4 text-xs leading-relaxed",
          )}
        >
          {document.draftNotice}
        </p>
      </header>

      <div className={cn("space-y-8", compact ? "mt-5" : "mt-8")}>
        {document.sections.map((section) => (
          <section key={section.id} id={section.id}>
            <h2 className={cn("font-semibold text-brand-ink", compact ? "text-sm" : "text-base")}>
              {section.title}
            </h2>
            <div className={cn("space-y-3", compact ? "mt-2" : "mt-3")}>
              {section.blocks.map((block, i) => {
                if (block.type === "paragraph") {
                  return (
                    <p key={i} className={cn("leading-relaxed text-brand-ink/75", compact ? "text-xs" : "text-sm")}>
                      {block.text}
                    </p>
                  );
                }
                if (block.type === "bullets") {
                  return (
                    <ul
                      key={i}
                      className={cn(
                        "list-disc space-y-1.5 pl-5 leading-relaxed text-brand-ink/75",
                        compact ? "text-xs" : "text-sm",
                      )}
                    >
                      {block.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <div key={i} className="overflow-x-auto rounded-xl border border-brand-ink/8">
                    <table className={cn("w-full text-left", compact ? "text-[11px]" : "text-xs")}>
                      <thead className="bg-brand-mist/60 text-brand-ink/55">
                        <tr>
                          <th className="px-3 py-2 font-semibold">{block.headers[0]}</th>
                          <th className="px-3 py-2 font-semibold">{block.headers[1]}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {block.rows.map(([a, b]) => (
                          <tr key={`${a}-${b}`} className="border-t border-brand-ink/6">
                            <td className="px-3 py-2 align-top text-brand-ink/80">{a}</td>
                            <td className="px-3 py-2 align-top text-brand-ink/70">{b}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}