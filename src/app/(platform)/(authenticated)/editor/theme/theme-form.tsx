"use client";

import { useState, useTransition } from "react";
import { updateThemeAction } from "@/app/actions/business";
import { Button } from "@/components/ui/button";
import type { ThemeConfig } from "@/core/types/page";

export function ThemeForm({ businessId, initialTheme }: { businessId: string; initialTheme: ThemeConfig }) {
  const [theme, setTheme] = useState(initialTheme);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-5 pb-28"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const r = await updateThemeAction(businessId, theme);
          setMessage(r.success ? "Theme applied" : r.error ?? "Save failed");
        });
      }}
    >
      <label className="flex min-h-14 items-center justify-between gap-4 rounded-2xl border border-brand-ink/10 bg-brand-surface px-4 py-3 shadow-card">
        <span className="text-sm font-semibold text-brand-ink">Primary color</span>
        <input
          type="color"
          value={theme.primaryColor}
          onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
          className="h-12 w-14 cursor-pointer rounded-xl border-0 bg-transparent p-0"
        />
      </label>
      <label className="flex min-h-14 items-center justify-between gap-4 rounded-2xl border border-brand-ink/10 bg-brand-surface px-4 py-3 shadow-card">
        <span className="text-sm font-semibold text-brand-ink">Accent color</span>
        <input
          type="color"
          value={theme.accentColor}
          onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
          className="h-12 w-14 cursor-pointer rounded-xl border-0 bg-transparent p-0"
        />
      </label>

      <div
        className="rounded-2xl border border-brand-ink/10 p-4 text-sm text-white shadow-card"
        style={{
          background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
        }}
      >
        Live preview — buttons & highlights use these colors on your site.
      </div>

      {message && <p className="text-sm text-brand-ink/70">{message}</p>}

      <div className="editor-sticky-actions">
        <Button type="submit" className="min-h-12 w-full" disabled={isPending}>
          {isPending ? "Applying…" : "Apply theme"}
        </Button>
      </div>
    </form>
  );
}
