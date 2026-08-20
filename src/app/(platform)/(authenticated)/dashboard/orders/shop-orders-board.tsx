"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { ShopOrderRow } from "@/app/actions/shop-orders";
import { updateShopOrderDeliveryAction } from "@/app/actions/shop-orders";
import { DELIVERY_STATUSES, deliveryStatusLabel } from "@/core/utils/catalog-mode";
import { toast } from "@/components/ui/toast";

export function ShopOrdersBoard({
  businessId,
  orders,
  deliveryOps,
  deliveryPartnerName,
}: {
  businessId: string;
  orders: ShopOrderRow[];
  deliveryOps: "manual" | "third_party";
  deliveryPartnerName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<Record<string, Partial<ShopOrderRow>>>({});

  if (orders.length === 0) {
    return (
      <div className="premium-card mt-4 px-4 py-8 text-center">
        <p className="text-sm font-semibold">No customer orders yet</p>
        <p className="mt-1 text-xs text-brand-muted">They appear here when someone checks out on your site.</p>
      </div>
    );
  }

  return (
    <ul className="mt-4 space-y-3">
      {orders.map((o) => {
        const d = { ...o, ...draft[o.orderId] };
        return (
          <li key={o.orderId} className="premium-card space-y-2 px-3 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-mono text-[11px] text-brand-muted">{o.orderId.slice(0, 8)}</p>
                <Link
                  href={`/dashboard/clients/${o.customerPhone}`}
                  className="text-sm font-semibold text-brand-ink underline"
                >
                  {o.customerName || "Customer"}
                </Link>
                <p className="text-[11px] text-brand-muted">{o.customerPhone}</p>
                <p className="mt-1 truncate text-xs text-brand-ink">{o.itemsLabel}</p>
                <p className="mt-0.5 text-[11px] text-brand-muted">
                  {o.customerAddress ? `Addr: ${o.customerAddress}` : "No address (service at shop)"}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold">₹{o.total}</p>
                <p className="text-[10px] font-semibold uppercase text-brand-muted">
                  {o.orderStatus} · {o.paymentMethod || o.paymentStatus}
                </p>
              </div>
            </div>

            <label className="block text-[11px] font-semibold text-brand-muted">
              Delivery status
              <select
                className="premium-input mt-1 text-sm"
                value={d.deliveryStatus}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, [o.orderId]: { ...prev[o.orderId], deliveryStatus: e.target.value } }))
                }
              >
                {DELIVERY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {deliveryStatusLabel(s)}
                  </option>
                ))}
              </select>
            </label>

            {deliveryOps === "third_party" ? (
              <div className="grid gap-2">
                <input
                  className="premium-input text-sm"
                  placeholder={deliveryPartnerName || "Courier name"}
                  value={d.deliveryPartner}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      [o.orderId]: { ...prev[o.orderId], deliveryPartner: e.target.value },
                    }))
                  }
                />
                <input
                  className="premium-input text-sm"
                  placeholder="Tracking ID"
                  value={d.trackingId}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      [o.orderId]: { ...prev[o.orderId], trackingId: e.target.value },
                    }))
                  }
                />
                <input
                  className="premium-input text-sm"
                  placeholder="Tracking URL (optional)"
                  value={d.trackingUrl}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      [o.orderId]: { ...prev[o.orderId], trackingUrl: e.target.value },
                    }))
                  }
                />
              </div>
            ) : null}

            <button
              type="button"
              disabled={isPending}
              className="text-xs font-bold text-brand-turquoise"
              onClick={() =>
                startTransition(async () => {
                  const r = await updateShopOrderDeliveryAction({
                    businessId,
                    orderId: o.orderId,
                    phone: o.customerPhone,
                    deliveryStatus: d.deliveryStatus || "pending",
                    deliveryPartner: d.deliveryPartner,
                    trackingId: d.trackingId,
                    trackingUrl: d.trackingUrl,
                  });
                  if (r.success) toast.success("Delivery updated");
                  else toast.error(r.error ?? "Update failed");
                })
              }
            >
              Save delivery
            </button>
          </li>
        );
      })}
    </ul>
  );
}
