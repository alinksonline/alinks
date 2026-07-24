"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { cn } from "@/core/utils/cn";

const STORAGE_KEY = "alinks_cookie_notice_v1";

/**
 * Essential-cookies notice — mobile-frame aligned, brand tokens, toast on accept.
 * Session / OTP / OAuth cookies only — not ads.
 */
export function CookieNotice() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      if (window.localStorage.getItem(STORAGE_KEY) === "1") return;
      // slight delay so layout paints first
      const t = window.setTimeout(() => setVisible(true), 400);
      return () => window.clearTimeout(t);
    } catch {
      setVisible(true);
    }
  }, []);

  function accept() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* private mode */
    }
    setExiting(true);
    toast.success("Preferences saved", "Essential cookies only — no ad trackers.");
    window.setTimeout(() => setVisible(false), 220);
  }

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-notice-title"
      aria-describedby="cookie-notice-desc"
    >
      <div
        className={cn(
          "pointer-events-auto w-full max-w-app origin-bottom",
          exiting ? "animate-cookie-out" : "animate-cookie-in",
        )}
      >
        <div className="overflow-hidden rounded-2.5xl border border-brand-ink/10 bg-brand-surface/95 shadow-premium backdrop-blur-xl dark:border-white/10">
          {/* accent bar */}
          <div className="h-1 w-full bg-brand-gradient" aria-hidden />

          <div className="p-4">
            <div className="flex items-start gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-mist text-brand-turquoise dark:bg-white/5"
                aria-hidden
              >
                <CookieIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-turquoise">
                  Privacy
                </p>
                <h2
                  id="cookie-notice-title"
                  className="mt-0.5 font-display text-[15px] font-bold leading-snug text-brand-ink"
                >
                  Essential cookies only
                </h2>
                <p
                  id="cookie-notice-desc"
                  className="mt-1.5 text-[12.5px] leading-relaxed text-brand-muted"
                >
                  We use cookies for sign-in, security, and theme preferences — not advertising.
                  You can read the full notice anytime.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <Link
                href="/cookies"
                className="text-[12px] font-semibold text-brand-turquoise underline-offset-2 transition hover:underline"
              >
                Cookie notice
              </Link>
              <span className="text-brand-ink/20" aria-hidden>
                ·
              </span>
              <Link
                href="/privacy"
                className="text-[12px] font-semibold text-brand-turquoise underline-offset-2 transition hover:underline"
              >
                Privacy policy
              </Link>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                variant="primary"
                onClick={accept}
                className="h-11 flex-1 rounded-full text-[13px] font-semibold shadow-accent"
              >
                Got it
              </Button>
              <Link
                href="/cookies"
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-brand-ink/12 bg-brand-mist px-4 text-[13px] font-semibold text-brand-ink transition hover:bg-brand-mist/80 dark:border-white/10 dark:bg-white/5"
              >
                Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CookieIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3a9 9 0 1 0 9 9c0-.4-.3-.7-.7-.7a2.3 2.3 0 0 1-2.2-2.2c0-.4-.3-.7-.7-.7A2.3 2.3 0 0 1 15 6.2c0-.4-.3-.7-.7-.7A2.3 2.3 0 0 1 12 3.3V3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="14.5" cy="12.5" r="1" fill="currentColor" />
      <circle cx="10.5" cy="15.5" r="1" fill="currentColor" />
    </svg>
  );
}
