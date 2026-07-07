const lines: { prompt?: boolean; text: string; color?: string }[] = [
  { text: "$ alinks route --handle demo" },
  { text: "→ surface: tenant_site", color: "text-tech-green" },
  { text: "→ storage: google_sheets", color: "text-tech-green" },
  { text: "→ tier: pro · checkout: enabled", color: "text-brand-turquoise-light" },
  { text: "" },
  { text: "$ alinks write-queue status" },
  { text: "pending: 0 · failed: 0 · latency_p99: 42ms", color: "text-zinc-400" },
  { text: "" },
  { prompt: true, text: "POST /api/orders → tenant Sheet ✓", color: "text-tech-cyan" },
];

export function TerminalPanel() {
  return (
    <div className="tech-panel min-w-0 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-tech-border px-3 py-2.5 sm:px-4">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <span className="ml-1 truncate font-mono text-[10px] text-zinc-500 sm:text-[11px]">alinks-cli — zsh</span>
        <span className="ml-auto hidden font-mono text-[10px] text-tech-green sm:inline">● live</span>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[11px] leading-relaxed sm:p-4 sm:text-xs">
        {lines.map((line, i) => (
          <div key={i} className={line.color ?? "text-zinc-300"}>
            {line.prompt && <span className="text-tech-cyan">❯ </span>}
            {line.text || "\u00A0"}
          </div>
        ))}
        <div className="mt-1 text-tech-cyan">
          <span className="text-tech-green">➜</span> <span className="animate-pulse">_</span>
        </div>
      </pre>
    </div>
  );
}