"use client";

import { useState, useTransition } from "react";
import { connectSupabaseAction } from "@/app/actions/supabase";
import { Button } from "@/components/ui/button";

export function DataSupabaseByoForm({
  businessId,
  projectUrl,
  connected,
  storageBackend,
}: {
  businessId: string;
  projectUrl: string;
  connected: boolean;
  storageBackend: string;
}) {
  const [url, setUrl] = useState(projectUrl);
  const [anonKey, setAnonKey] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const active = connected && storageBackend === "supabase";

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const r = await connectSupabaseAction(businessId, url, anonKey);
          setMessage(r.success ? "Supabase connected. Orders can use your project." : r.error ?? "");
          if (r.success) setAnonKey("");
        });
      }}
    >
      <div className="flex items-center justify-between gap-2 text-[12px]">
        <span className="text-brand-muted">Status</span>
        <span
          className={
            active
              ? "font-bold text-emerald-700 dark:text-emerald-300"
              : "font-bold text-brand-ink"
          }
        >
          {active ? "Connected" : "Not connected"}
        </span>
      </div>

      <div>
        <label className="text-[11px] font-semibold text-brand-muted" htmlFor="sb-url">
          Project URL
        </label>
        <input
          id="sb-url"
          className="premium-input mt-1 font-mono text-xs"
          placeholder="https://xxxx.supabase.co"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <div>
        <label className="text-[11px] font-semibold text-brand-muted" htmlFor="sb-key">
          Anon / publishable key
        </label>
        <input
          id="sb-key"
          type="password"
          className="premium-input mt-1 font-mono text-xs"
          placeholder="eyJ…"
          value={anonKey}
          onChange={(e) => setAnonKey(e.target.value)}
          autoComplete="off"
        />
        <p className="mt-1 text-[10px] text-brand-muted">
          You pay Supabase directly. We store a secure reference — not for ALINKS to own your data.
        </p>
      </div>
      <Button type="submit" variant="bronze" disabled={isPending || !url.trim() || !anonKey.trim()}>
        {isPending ? "Connecting…" : "Connect my Supabase"}
      </Button>
      {message ? <p className="text-[12px] text-brand-ink">{message}</p> : null}
    </form>
  );
}
