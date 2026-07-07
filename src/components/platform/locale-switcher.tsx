"use client";

import { useTransition } from "react";
import { updateLocaleAction } from "@/app/actions/settings";
import { SUPPORTED_LOCALES, type AppLocale } from "@/core/i18n/messages";

const LABELS: Record<AppLocale, string> = {
  en: "English",
  hi: "Hindi",
  te: "Telugu",
  ta: "Tamil",
  kn: "Kannada",
  ml: "Malayalam",
  mr: "Marathi",
};

export function LocaleSwitcher({ locale }: { locale: AppLocale }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      className="rounded-lg border px-3 py-2 text-sm"
      disabled={isPending}
      value={locale}
      onChange={(e) => startTransition(async () => { await updateLocaleAction(e.target.value as AppLocale); })}
    >
      {SUPPORTED_LOCALES.map((l) => (
        <option key={l} value={l}>
          {LABELS[l]}
        </option>
      ))}
    </select>
  );
}