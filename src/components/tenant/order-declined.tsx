"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readStashedCart } from "@/components/tenant/local-orders";

export function OrderDeclined({
  handle,
  cancelled,
  orderId,
  message,
}: {
  handle: string;
  cancelled: boolean;
  orderId?: string;
  message?: string;
}) {
  const [retryHref, setRetryHref] = useState(`/${handle}/store`);

  useEffect(() => {
    const cart = readStashedCart(handle);
    if (cart.length > 0) {
      setRetryHref(`/${handle}/checkout?cart=${encodeURIComponent(JSON.stringify(cart))}`);
    }
  }, [handle]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center"
      role="alertdialog"
      aria-labelledby="order-declined-title"
    >
      <div className="t-card w-full max-w-sm px-5 py-8 text-center shadow-xl">
        <svg className="mx-auto h-14 w-14 text-red-500" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
          <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
        <h1 id="order-declined-title" className="t-ink mt-4 text-xl font-bold tracking-tight">
          {cancelled ? "Payment cancelled" : "Payment declined"}
        </h1>
        <p className="t-muted mt-2 text-sm leading-relaxed">
          {cancelled
            ? "You closed the payment window. No money was taken and the order was not placed."
            : message?.trim() || "The payment did not go through. The order was not placed."}
        </p>
        {orderId ? (
          <p className="t-muted mt-3 font-mono text-[11px] break-all">Ref {orderId}</p>
        ) : null}
        <div className="mt-6 flex flex-col gap-2">
          <Link href={retryHref} className="t-btn-primary">
            Try again
          </Link>
          <Link href={`/${handle}/store`} className="t-link text-xs font-semibold">
            Back to shop
          </Link>
        </div>
      </div>
    </div>
  );
}
