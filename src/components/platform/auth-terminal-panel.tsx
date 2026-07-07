type AuthMode = "signup" | "login";

const linesByMode: Record<AuthMode, { prompt?: boolean; text: string; color?: string }[]> = {
  signup: [
    { text: "$ alinks auth --flow signup" },
    { text: "→ method: phone_otp", color: "text-tech-green" },
    { text: "→ trial: pro · duration: 14d", color: "text-brand-turquoise-light" },
    { text: "→ redirect: /onboarding", color: "text-tech-green" },
    { text: "" },
    { text: "$ alinks tenant --provision --dry-run" },
    { text: "pages: 5 · storage: google_sheets · pii: tenant_only", color: "text-zinc-400" },
    { text: "" },
    { prompt: true, text: "await auth.verifyOtp(phone, otp)", color: "text-tech-cyan" },
  ],
  login: [
    { text: "$ alinks auth --flow login" },
    { text: "→ method: phone_otp", color: "text-tech-green" },
    { text: "→ session: platform_postgres", color: "text-tech-green" },
    { text: "→ mfa: disabled (phase 0)", color: "text-zinc-500" },
    { text: "" },
    { text: "$ alinks session --lookup" },
    { text: "active: 0 · expired_ttl: 30d", color: "text-zinc-400" },
    { text: "" },
    { prompt: true, text: "await auth.verifyOtp(phone, otp)", color: "text-tech-cyan" },
  ],
};

export function AuthTerminalPanel({ mode }: { mode: AuthMode }) {
  const lines = linesByMode[mode];

  return (
    <div className="tech-panel min-w-0 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-tech-border px-3 py-2.5 sm:px-4">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <span className="ml-1 truncate font-mono text-[10px] text-zinc-500 sm:text-[11px]">
          alinks-auth — {mode}
        </span>
        <span className="ml-auto font-mono text-[10px] text-tech-green">● ready</span>
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