"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readLocalOrders } from "@/components/tenant/local-orders";

export function OrderThankYou({ handle, orderId }: { handle: string; orderId?: string }) {
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    const found = readLocalOrders(handle).find((o) => o.orderId === orderId);
    if (!found) return;
    const lines = found.items.map((i) => `${i.qty} × ${i.name}`).join(", ");
    setSummary(`${lines} · ₹${found.total}`);
  }, [handle, orderId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center"
      role="dialog"
      aria-labelledby="order-thanks-title"
    >
      <div className="t-card w-full max-w-sm px-5 py-8 text-center shadow-xl">
        <svg className="mx-auto h-14 w-14 text-green-500" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
          <path d="M8 12.5 10.5 15 16 9.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h1 id="order-thanks-title" className="t-ink mt-4 text-xl font-bold tracking-tight">
          Thank you for ordering
        </h1>
        <p className="t-muted mt-2 text-sm leading-relaxed">
          Your order was placed successfully. The shop has it and will process it shortly.
        </p>
        {orderId ? (
          <div className="mt-5 rounded-xl border border-[var(--t-border)] bg-[var(--t-soft)] px-3 py-3">
            <p className="t-muted text-[10px] font-bold uppercase tracking-wider">Order ID</p>
            <p className="t-ink mt-0.5 font-mono text-sm font-bold break-all">{orderId}</p>
            {summary ? <p className="t-muted mt-2 text-xs leading-relaxed">{summary}</p> : null}
          </div>
        ) : null}
        <div className="mt-6 flex flex-col gap-2">
          <Link href={`/${handle}/orders`} className="t-btn-primary">
            View my orders
          </Link>
          <Link href={`/${handle}/store`} className="t-link text-xs font-semibold">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
