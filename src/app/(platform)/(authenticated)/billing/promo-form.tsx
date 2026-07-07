"use client";

import { useState, useTransition } from "react";
import { applyPromoCodeAction } from "@/app/actions/promo";
import { Button } from "@/components/ui/button";

export function PromoForm() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="mt-6 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const r = await applyPromoCodeAction(code);
          setMessage(r.success ? `Applied! Trial extended to ${r.trialEndsAt}` : r.error ?? "");
        });
      }}
    >
      <h2 className="font-semibold">Promo codes</h2>
      <p className="text-sm text-slate-600">
        FIRST100 — pay 10 months, get 12 on annual plans (first 100 tenants). FREEMONTH extends trial by 1 month.
        No monthly launch discount.
      </p>
      <input className="w-full rounded-lg border px-3 py-2 font-mono text-sm uppercase" value={code} onChange={(e) => setCode(e.target.value)} placeholder="FIRST100" />
      <Button type="submit" disabled={isPending}>Apply code</Button>
      {message && <p className="text-sm">{message}</p>}
    </form>
  );
}