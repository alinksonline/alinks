"use client";

import { useState, useTransition } from "react";
import { generateContentAction, purchaseCreditPackAction } from "@/app/actions/ai";
import { Button } from "@/components/ui/button";

export function AiPanel({
  stats,
  businessName,
  vertical,
}: {
  stats: { tier: string; aiCredits: number; fieldUsed: number; seoUsed: number; packs: readonly { id: string; credits: number; priceInr: number }[] };
  businessName: string;
  vertical: string;
}) {
  const [prompt, setPrompt] = useState("Write SEO title and meta for my homepage");
  const [result, setResult] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-lg border bg-white p-4 text-sm">
        <p>Tier: <strong>{stats.tier}</strong></p>
        <p>Field generates this month: {stats.fieldUsed}</p>
        <p>SEO meta this month: {stats.seoUsed}</p>
        <p>Credit balance: {stats.aiCredits}</p>
      </div>

      <div className="space-y-3">
        <textarea className="w-full rounded-lg border px-3 py-2 text-sm" rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const r = await generateContentAction({ taskType: "seo_meta", prompt, businessName, vertical });
                if (r.success) setResult(r.result);
              })
            }
          >
            Generate SEO
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const r = await generateContentAction({ taskType: "share_caption", prompt, businessName, vertical });
                if (r.success) setResult(r.result);
              })
            }
          >
            Share caption
          </Button>
        </div>
        {result && <pre className="whitespace-pre-wrap rounded-lg border bg-slate-50 p-4 text-sm">{result}</pre>}
      </div>

      <div>
        <h2 className="font-semibold">Credit packs</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {stats.packs.map((p) => (
            <Button
              key={p.id}
              type="button"
              disabled={isPending}
              onClick={() => startTransition(async () => { await purchaseCreditPackAction(p.id); })}
            >
              {p.credits} credits — ₹{p.priceInr}
            </Button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">Dev mode: packs add credits instantly without Razorpay.</p>
      </div>
    </div>
  );
}