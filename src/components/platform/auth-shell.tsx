import Link from "next/link";
import type { ReactNode } from "react";
import { AlinksLogo } from "@/components/shared/alinks-logo";
import { AuthTerminalPanel } from "@/components/platform/auth-terminal-panel";

type AuthMode = "signup" | "login";

const perks = [
  { label: "trial tier", value: "Pro" },
  { label: "trial days", value: "14" },
  { label: "pages", value: "5" },
  { label: "PII in platform DB", value: "0" },
];

interface AuthShellProps {
  mode: AuthMode;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ mode, title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-tech-bg text-white">
      <div className="pointer-events-none absolute inset-0 tech-grid-bg opacity-40" />
      <div className="pointer-events-none absolute right-0 top-0 h-[400px] w-[600px] rounded-full bg-cyan-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[300px] w-[500px] rounded-full bg-emerald-500/5 blur-[80px]" />

      <header className="relative z-10 border-b border-tech-border bg-tech-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
          <Link href="/" className="shrink-0">
            <AlinksLogo height={28} variant="dark" priority />
          </Link>
          <Link
            href="/"
            className="font-mono text-[10px] text-zinc-500 transition hover:text-tech-cyan sm:text-xs"
          >
            ← back to platform
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-6xl flex-col px-4 py-8 sm:min-h-[calc(100vh-4rem)] sm:px-6 sm:py-10 lg:flex-row lg:items-center lg:gap-16 lg:px-8 lg:py-12">
        {/* Branding — below form on mobile, left on desktop */}
        <div className="order-2 mt-10 min-w-0 lg:order-1 lg:mt-0 lg:flex-1">
          <span className="tech-label">{mode === "signup" ? "tenant onboarding" : "session restore"}</span>
          <h1 className="mt-4 text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
            {mode === "signup" ? (
              <>
                Deploy your
                <br />
                <span className="bg-gradient-to-r from-tech-cyan to-emerald-400 bg-clip-text text-transparent">
                  14-day Pro trial.
                </span>
              </>
            ) : (
              <>
                Welcome back to
                <br />
                <span className="bg-gradient-to-r from-tech-cyan to-emerald-400 bg-clip-text text-transparent">
                  your dashboard.
                </span>
              </>
            )}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
            {mode === "signup"
              ? "Phone OTP signup · no card required · full Pro features during trial. Client data stays in your Google Sheet or BYO Supabase."
              : "Sign in with the phone number you used at signup. Sessions are stored in platform Postgres — never your customer PII."}
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-tech-border pt-6 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {perks.map((p) => (
              <div key={p.label} className="min-w-0">
                <dt className="truncate font-mono text-[10px] uppercase tracking-wider text-zinc-500">{p.label}</dt>
                <dd className="mt-1 font-mono text-base font-semibold text-white sm:text-lg">{p.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 hidden lg:block">
            <AuthTerminalPanel mode={mode} />
            <p className="mt-3 font-mono text-[10px] text-zinc-600">
              {"// verifyOtp() → createSession() → redirect"}
            </p>
          </div>
        </div>

        {/* Form panel — first on mobile */}
        <div className="order-1 min-w-0 lg:order-2 lg:w-[min(100%,24rem)] lg:shrink-0">
          <div className="tech-panel shadow-glow">
            <div className="border-b border-tech-border px-5 py-4 sm:px-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-tech-cyan">
                {mode === "signup" ? "auth.signup" : "auth.login"}
              </p>
              <h2 className="mt-2 text-lg font-bold text-white sm:text-xl">{title}</h2>
              <p className="mt-1 font-mono text-xs text-zinc-500">{subtitle}</p>
            </div>
            <div className="px-5 py-6 sm:px-6">{children}</div>
            {footer && (
              <div className="border-t border-tech-border px-5 py-4 text-center sm:px-6">{footer}</div>
            )}
          </div>

          <div className="mt-6 lg:hidden">
            <AuthTerminalPanel mode={mode} />
          </div>
        </div>
      </div>
    </main>
  );
}