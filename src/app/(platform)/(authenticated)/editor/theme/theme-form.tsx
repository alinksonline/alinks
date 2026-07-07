"use client";

import { useState, useTransition } from "react";
import { updateThemeAction } from "@/app/actions/business";
import { Button } from "@/components/ui/button";
import type { ThemeConfig } from "@/core/types/page";

export function ThemeForm({ businessId, initialTheme }: { businessId: string; initialTheme: ThemeConfig }) {
  const [theme, setTheme] = useState(initialTheme);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          await updateThemeAction(businessId, theme);
        });
      }}
    >
      <label className="block text-sm">
        Primary color
        <input
          type="color"
          value={theme.primaryColor}
          onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
          className="ml-2"
        />
      </label>
      <label className="block text-sm">
        Accent color
        <input
          type="color"
          value={theme.accentColor}
          onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
          className="ml-2"
        />
      </label>
      <Button type="submit" disabled={isPending}>
        Apply theme
      </Button>
    </form>
  );
}