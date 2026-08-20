"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import type { CartItem } from "@/core/types/commerce";
import {
  cancelCustomerOrderAction,
  lookupOrdersByPhoneAction,
  modifyCustomerOrderAction,
  type PublicOrder,
} from "@/app/actions/customer-orders";
import { patchLocalOrder, readLocalOrders, type SavedLocalOrder } from "@/components/tenant/local-orders";
import { cartRequiresAddress } from "@/core/utils/order-fulfillment";

export function OrderHistory({
  handle,
  businessPhone,
  allowCancel,
  allowModify,
  lockedPhone,
}: {
  handle: string;
  businessPhone: string;
  allowCancel: boolean;
  allowModify: boolean;
  lockedPhone?: string | null;
}) {
  const [mounted, setMounted] = useState(false);
  const [local, setLocal] = useState<SavedLocalOrder[]>([]);
  const [phone, setPhone] = useState("");
  const [lookedUp, setLookedUp] = useState<PublicOrder[] | null>(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItems, setEditItems] = useState<CartItem[]>([]);
  const [editAddress, setEditAddress] = useState("");

  useEffect(() => {
    setMounted(true);
    const stored = readLocalOrders(handle);
    setLocal(stored);
    const startPhone = lockedPhone || stored.find((o) => o.customerPhone)?.customerPhone;
    if (startPhone) setPhone(startPhone);
    if (lockedPhone) {
      void lookupOrdersByPhoneAction(handle, lockedPhone).then((r) => {
        if (r.success) setLookedUp(r.orders);
      });
    }
  }, [handle, lockedPhone]);

  function refreshLocal() {
    setLocal(readLocalOrders(handle));
  }

  if (!mounted) return <div className="t-card h-40 animate-pulse bg-[var(--t-soft)]" />;

  const display =
    lookedUp ??
    local.map((o) => ({
      orderId: o.orderId,
      createdAt: o.date,
      items: o.items,
      total: o.total,
      paymentMethod: o.method,
      paymentStatus: o.status,
      orderStatus: o.status === "declined" ? "declined" : o.status === "cancelled" ? "cancelled" : "placed",
      customerName: o.customerName ?? "",
      customerPhone: o.customerPhone ?? phone,
      customerAddress: o.customerAddress ?? "",
      canCancel: allowCancel && o.status !== "cancelled" && o.status !== "declined",
      canModify: allowModify && o.status !== "cancelled" && o.status !== "declined",
    }));

  return (
    <div className="space-y-5">
      <form
        className="t-card space-y-2 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const r = await lookupOrdersByPhoneAction(handle, phone);
            if (!r.success) {
              setMessage(r.error);
              return;
            }
            setLookedUp(r.orders);
            setMessage(r.orders.length ? "" : "No orders for this number at this shop.");
          });
        }}
      >
        <p className="t-ink text-sm font-semibold">Find orders by phone</p>
        <p className="t-muted text-[11px] leading-relaxed">
          Use the mobile number you entered at checkout.
        </p>
        <div className="flex gap-2">
          <input
            className="t-input flex-1"
            inputMode="numeric"
            placeholder="10-digit mobile"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          />
          <button type="submit" className="t-btn-primary !min-h-10 !w-auto px-4 text-xs" disabled={isPending}>
            Find
          </button>
        </div>
      </form>

      {display.length === 0 ? (
        <div className="t-card px-4 py-12 text-center">
          <svg className="t-muted mx-auto mb-4 h-12 w-12 opacity-50" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 8h16l-1.2 11H5.2L4 8Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.75" />
          </svg>
          <p className="t-ink font-semibold">No orders yet</p>
          <p className="t-muted mt-1 text-sm">Place an order, then it will show here.</p>
          <Link href={`/${handle}/store`} className="t-btn-primary mt-6 inline-flex">
            Start shopping
          </Link>
        </div>
      ) : (
        display.map((order) => (
          <div key={order.orderId} className="t-card overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--t-border)] bg-[var(--t-soft)] px-4 py-3">
              <div>
                <p className="t-muted font-mono text-[11px]">{order.orderId.slice(0, 8)}</p>
                <p className="t-ink mt-0.5 text-sm font-semibold">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Order"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold" style={{ color: "var(--t-primary-text, var(--t-primary))" }}>
                  ₹{order.total}
                </p>
                <span className="mt-1 inline-block rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold uppercase dark:bg-white/10">
                  {order.orderStatus === "cancelled"
                    ? "Cancelled"
                    : order.orderStatus === "declined" || order.paymentStatus === "declined"
                      ? "Declined"
                      : order.orderStatus === "modified"
                        ? "Updated"
                        : order.paymentMethod === "cod"
                          ? "COD placed"
                          : "Placed"}
                </span>
              </div>
            </div>
            <div className="space-y-2 px-4 py-3">
              {(editingId === order.orderId ? editItems : order.items).map((item, idx) => (
                <div key={`${item.productId}-${idx}`} className="flex items-center justify-between gap-2 text-sm">
                  <span className="t-ink truncate pr-2">
                    {editingId === order.orderId ? (
                      <span className="flex items-center gap-2">
                        <button
                          type="button"
                          className="t-slot-chip !px-2"
                          onClick={() =>
                            setEditItems((list) =>
                              list.map((x, i) => (i === idx ? { ...x, qty: Math.max(0, x.qty - 1) } : x)),
                            )
                          }
                        >
                          −
                        </button>
                        {item.qty} × {item.name}
                        <button
                          type="button"
                          className="t-slot-chip !px-2"
                          onClick={() =>
                            setEditItems((list) =>
                              list.map((x, i) => (i === idx ? { ...x, qty: x.qty + 1 } : x)),
                            )
                          }
                        >
                          +
                        </button>
                      </span>
                    ) : (
                      `${item.qty} × ${item.name}`
                    )}
                  </span>
                  <span className="t-muted shrink-0">₹{item.price * item.qty}</span>
                </div>
              ))}
              {editingId === order.orderId && cartRequiresAddress(editItems) ? (
                <textarea
                  className="t-input mt-2 min-h-[4rem]"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Delivery address"
                />
              ) : order.customerAddress ? (
                <p className="t-muted text-[11px]">Deliver to: {order.customerAddress}</p>
              ) : (
                <p className="t-muted text-[11px]">Service at the shop — no address</p>
              )}
            </div>
            {!order.canCancel && !order.canModify && businessPhone ? (
              <div className="border-t border-[var(--t-border)] px-4 py-3">
                <a
                  href={`https://wa.me/${businessPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                    `Hi, I placed order ${order.orderId} and would like to change it.`,
                  )}`}
                  className="t-link text-xs font-semibold"
                  target="_blank"
                  rel="noreferrer"
                >
                  Message the shop about this order
                </a>
              </div>
            ) : null}
            {order.canCancel || order.canModify ? (
              <div className="flex flex-wrap gap-2 border-t border-[var(--t-border)] bg-[var(--t-soft)] px-4 py-3">
                {order.canModify && editingId !== order.orderId ? (
                  <button
                    type="button"
                    className="t-link text-xs font-semibold"
                    onClick={() => {
                      setEditingId(order.orderId);
                      setEditItems(order.items.map((i) => ({ ...i })));
                      setEditAddress(order.customerAddress);
                    }}
                  >
                    Modify
                  </button>
                ) : null}
                {editingId === order.orderId ? (
                  <>
                    <button
                      type="button"
                      className="t-btn-primary !min-h-9 !w-auto px-3 text-xs"
                      disabled={isPending}
                      onClick={() =>
                        startTransition(async () => {
                          const r = await modifyCustomerOrderAction({
                            handle,
                            orderId: order.orderId,
                            phone: order.customerPhone || phone,
                            items: editItems,
                            customerAddress: editAddress,
                          });
                          if (!r.success) {
                            setMessage(r.error);
                            return;
                          }
                          patchLocalOrder(handle, order.orderId, {
                            items: editItems.filter((i) => i.qty > 0),
                            total: r.total,
                            status: "modified",
                            customerAddress: editAddress,
                          });
                          setEditingId(null);
                          setLookedUp(null);
                          refreshLocal();
                          setMessage("Order updated.");
                        })
                      }
                    >
                      Save changes
                    </button>
                    <button type="button" className="t-link text-xs" onClick={() => setEditingId(null)}>
                      Cancel edit
                    </button>
                  </>
                ) : null}
                {order.canCancel && editingId !== order.orderId ? (
                  <button
                    type="button"
                    className="text-xs font-semibold text-red-600"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        const r = await cancelCustomerOrderAction({
                          handle,
                          orderId: order.orderId,
                          phone: order.customerPhone || phone,
                        });
                        if (!r.success) {
                          setMessage(r.error);
                          return;
                        }
                        patchLocalOrder(handle, order.orderId, { status: "cancelled" });
                        setLookedUp(null);
                        refreshLocal();
                        setMessage("Order cancelled.");
                      })
                    }
                  >
                    Cancel order
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ))
      )}
      {message ? <p className="t-muted text-center text-xs">{message}</p> : null}
    </div>
  );
}
