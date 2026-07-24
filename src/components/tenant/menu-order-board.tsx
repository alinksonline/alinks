"use client";

import { useMemo, useState, useTransition } from "react";
import type { MenuItemPublic } from "@/components/tenant/menu-catalog";
import { placeFoodOrderAction } from "@/app/actions/food-ops";
import type { FoodChannel } from "@/core/config/food-compat";

type Channels = {
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  dineInEnabled: boolean;
  pickupInstructions?: string | null;
  deliveryInstructions?: string | null;
};

/**
 * Cart + channel checkout for Food ops (pickup / delivery / dine-in).
 * Cloud kitchens never receive dine-in (server-gated).
 */
export function MenuOrderBoard({
  handle,
  items,
  channels,
  tableCode: initialTable,
  tableLabel,
}: {
  handle: string;
  items: MenuItemPublic[];
  channels: Channels;
  tableCode?: string;
  tableLabel?: string;
}) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [channel, setChannel] = useState<FoodChannel>(() => {
    if (initialTable && channels.dineInEnabled) return "dine_in";
    if (channels.pickupEnabled) return "pickup";
    if (channels.deliveryEnabled) return "delivery";
    return "pickup";
  });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [tableCode, setTableCode] = useState(initialTable ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const availableChannels = useMemo(() => {
    const list: { id: FoodChannel; label: string }[] = [];
    if (channels.pickupEnabled) list.push({ id: "pickup", label: "Pickup" });
    if (channels.deliveryEnabled) list.push({ id: "delivery", label: "Delivery" });
    if (channels.dineInEnabled) list.push({ id: "dine_in", label: "Dine-in" });
    return list;
  }, [channels]);

  const cartLines = useMemo(() => {
    return items
      .filter((i) => (cart[i.id] ?? 0) > 0)
      .map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        qty: cart[i.id],
      }));
  }, [cart, items]);

  const total = cartLines.reduce((s, i) => s + i.price * i.qty, 0);

  if (!availableChannels.length) return null;

  if (orderCode) {
    return (
      <div className="t-card mt-6 space-y-2 p-4 text-center">
        <p className="text-sm font-bold text-[var(--t-ink,#0f172a)]">Order placed</p>
        <p className="font-mono text-lg font-bold" style={{ color: "var(--t-primary)" }}>
          {orderCode}
        </p>
        <p className="t-muted text-xs">
          Show this code at the counter / to the rider. Tracked on the kitchen board.
        </p>
        <button
          type="button"
          className="t-link text-xs font-semibold"
          onClick={() => {
            setOrderCode(null);
            setCart({});
            setStatus(null);
          }}
        >
          Place another order
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div>
        <p className="t-label">Order channel</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {availableChannels.map((c) => (
            <button
              key={c.id}
              type="button"
              className="t-slot-chip"
              data-selected={channel === c.id ? "true" : "false"}
              onClick={() => setChannel(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
        {channel === "pickup" && channels.pickupInstructions ? (
          <p className="t-muted mt-2 text-xs">{channels.pickupInstructions}</p>
        ) : null}
        {channel === "delivery" && channels.deliveryInstructions ? (
          <p className="t-muted mt-2 text-xs">{channels.deliveryInstructions}</p>
        ) : null}
        {channel === "dine_in" ? (
          <p className="t-muted mt-2 text-xs">
            Restaurant Dine-in · table {tableLabel || tableCode || "—"} (scan QR or enter code)
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="t-label">Add items</p>
        {items.map((item) => {
          const qty = cart[item.id] ?? 0;
          return (
            <div key={item.id} className="t-card flex items-center justify-between gap-2 px-3 py-2">
              <div className="min-w-0">
                <p className="t-ink text-xs font-semibold">{item.name}</p>
                <p className="t-muted text-[10px]">₹{item.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="h-7 w-7 rounded-full border text-sm font-bold"
                  onClick={() =>
                    setCart((c) => {
                      const n = { ...c };
                      const q = (n[item.id] ?? 0) - 1;
                      if (q <= 0) delete n[item.id];
                      else n[item.id] = q;
                      return n;
                    })
                  }
                  disabled={qty === 0}
                >
                  −
                </button>
                <span className="w-5 text-center text-xs font-bold">{qty}</span>
                <button
                  type="button"
                  className="h-7 w-7 rounded-full border text-sm font-bold"
                  onClick={() => setCart((c) => ({ ...c, [item.id]: (c[item.id] ?? 0) + 1 }))}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {cartLines.length > 0 ? (
        <div className="t-card space-y-3 p-4">
          <div className="flex justify-between text-sm font-bold">
            <span>Total</span>
            <span style={{ color: "var(--t-primary)" }}>₹{total}</span>
          </div>
          <input
            className="t-input"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {(channel === "delivery" || channel === "pickup") && (
            <input
              className="t-input"
              placeholder="Phone (10 digits)"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            />
          )}
          {channel === "delivery" && (
            <textarea
              className="t-input min-h-[64px]"
              placeholder="Delivery address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          )}
          {channel === "dine_in" && (
            <input
              className="t-input"
              placeholder="Table code (from QR)"
              value={tableCode}
              onChange={(e) => setTableCode(e.target.value.toUpperCase())}
              readOnly={Boolean(initialTable)}
            />
          )}
          <input
            className="t-input"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <button
            type="button"
            className="t-btn-primary"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const r = await placeFoodOrderAction({
                  handle,
                  channel,
                  items: cartLines,
                  customerName: name,
                  customerPhone: phone,
                  customerAddress: address,
                  notes,
                  tableCode: channel === "dine_in" ? tableCode : undefined,
                });
                if (!r.success) {
                  setStatus(r.error ?? "Failed");
                  return;
                }
                setOrderCode(r.orderCode);
                setStatus(null);
              })
            }
          >
            {isPending ? "Placing…" : `Place ${channel.replace("_", "-")} order`}
          </button>
          {status ? <p className="text-xs font-medium text-red-600">{status}</p> : null}
        </div>
      ) : (
        <p className="t-muted text-center text-xs">Add items above to place a pickup / delivery / dine-in order.</p>
      )}
    </div>
  );
}
