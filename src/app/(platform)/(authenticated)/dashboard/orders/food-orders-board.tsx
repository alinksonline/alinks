"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateFoodOrderStatusAction,
  type FoodTicketStatus,
} from "@/app/actions/food-ops";

type Order = {
  id: string;
  orderCode: string;
  channel: string;
  status: string;
  tableLabel: string | null;
  items: unknown;
  total: number;
  customerName: string | null;
  notes: string | null;
  createdAt: Date | string;
};

const NEXT: Partial<Record<string, FoodTicketStatus>> = {
  new: "preparing",
  preparing: "ready",
  ready: "completed",
  out_for_delivery: "completed",
};

export function FoodOrdersBoard({
  businessId,
  orders,
}: {
  businessId: string;
  orders: Order[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const setStatus = (orderId: string, status: FoodTicketStatus) => {
    startTransition(async () => {
      await updateFoodOrderStatusAction(businessId, orderId, status);
      router.refresh();
    });
  };

  if (!orders.length) {
    return (
      <div className="premium-card mt-5 px-4 py-8 text-center">
        <p className="text-sm font-semibold">No open tickets</p>
        <p className="mt-1 text-xs text-brand-muted">
          Enable pickup / delivery / dine-in under Menu, then take orders from the public menu.
        </p>
      </div>
    );
  }

  return (
    <ul className="mt-5 space-y-2">
      {orders.map((o) => {
        const items = Array.isArray(o.items)
          ? (o.items as { name: string; qty: number; price: number }[])
          : [];
        const next = NEXT[o.status];
        return (
          <li key={o.id} className="premium-card px-3 py-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-bold font-mono">{o.orderCode}</p>
                <p className="mt-0.5 text-[11px] text-brand-muted uppercase tracking-wide">
                  {o.channel.replace("_", "-")}
                  {o.tableLabel ? ` · ${o.tableLabel}` : ""} · {o.status}
                </p>
                <p className="mt-1 text-xs text-brand-ink">{o.customerName || "Guest"}</p>
                <ul className="mt-1.5 space-y-0.5 text-[11px] text-brand-muted">
                  {items.map((i, idx) => (
                    <li key={idx}>
                      {i.qty}× {i.name} · ₹{i.price * i.qty}
                    </li>
                  ))}
                </ul>
                {o.notes ? <p className="mt-1 text-[11px] italic text-brand-muted">{o.notes}</p> : null}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold">₹{o.total}</p>
                <div className="mt-2 flex flex-col gap-1">
                  {o.channel === "delivery" && o.status === "ready" ? (
                    <button
                      type="button"
                      disabled={isPending}
                      className="rounded-full bg-sky-50 px-2 py-1 text-[10px] font-semibold text-sky-900"
                      onClick={() => setStatus(o.id, "out_for_delivery")}
                    >
                      Out for delivery
                    </button>
                  ) : null}
                  {next ? (
                    <button
                      type="button"
                      disabled={isPending}
                      className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-900"
                      onClick={() => setStatus(o.id, next)}
                    >
                      → {next.replace("_", " ")}
                    </button>
                  ) : null}
                  {o.status !== "cancelled" && o.status !== "completed" ? (
                    <button
                      type="button"
                      disabled={isPending}
                      className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-800"
                      onClick={() => setStatus(o.id, "cancelled")}
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
