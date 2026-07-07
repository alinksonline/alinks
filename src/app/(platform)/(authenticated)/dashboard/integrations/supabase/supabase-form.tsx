"use client";

import { useState, useTransition } from "react";
import { connectSupabaseAction } from "@/app/actions/supabase";
import { Button } from "@/components/ui/button";

export function SupabaseForm({
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

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const r = await connectSupabaseAction(businessId, url, anonKey);
          setMessage(r.success ? "Supabase connected" : r.error ?? "");
          if (r.success) setAnonKey("");
        });
      }}
    >
      <p className="text-sm text-slate-600">
        Status: <strong>{connected && storageBackend === "supabase" ? "Connected" : "Not connected"}</strong>
      </p>
      <div>
        <label className="text-sm font-medium">Project URL</label>
        <input
          className="mt-1 w-full rounded-lg border px-3 py-2 font-mono text-sm"
          placeholder="https://xyz.supabase.co"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Anon key</label>
        <input
          className="mt-1 w-full rounded-lg border px-3 py-2 font-mono text-sm"
          type="password"
          placeholder="eyJ..."
          value={anonKey}
          onChange={(e) => setAnonKey(e.target.value)}
        />
        <p className="mt-1 text-xs text-slate-500">Only a hash ref is stored — never the raw key.</p>
      </div>
      <Button type="submit" disabled={isPending || !url.trim() || !anonKey.trim()}>
        Connect Supabase
      </Button>
      {message && <p className="text-sm text-slate-700">{message}</p>}
    </form>
  );
}