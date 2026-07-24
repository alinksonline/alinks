"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "alinks_cookie_notice_v1";

/**
 * Essential-cookies notice for marketing + platform chrome.
 * ALINKS does not use marketing/tracking cookies by default —
 * session, OTP, and OAuth state cookies only.
 */
export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      if (window.localStorage.getItem(STORAGE_KEY) === "1") return;
      setVisible(true);
    } catch {
      /* private mode — still show once per mount */
      setVisible(true);
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4"
    >
      <div className="mx-auto flex max-w-lg flex-col gap-3 rounded-2xl border border-brand-ink/10 bg-white/95 p-4 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-[#0c0c10]/95 dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] sm:flex-row sm:items-center sm:gap-4">
        <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-stone-600 dark:text-zinc-300">
          We use essential cookies for sign-in, security, and preferences — not ads.{" "}
          <Link
            href="/cookies"
            className="font-medium text-brand-turquoise underline-offset-2 hover:underline dark:text-brand-turquoise-light"
          >
            Cookie notice
          </Link>
          {" · "}
          <Link
            href="/privacy"
            className="font-medium text-brand-turquoise underline-offset-2 hover:underline dark:text-brand-turquoise-light"
          >
            Privacy
          </Link>
        </p>
        <Button
          type="button"
          variant="primary"
          onClick={dismiss}
          className="h-10 shrink-0 rounded-full px-5 text-sm font-semibold"
        >
          Got it
        </Button>
      </div>
    </div>
  );
}
