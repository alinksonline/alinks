"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  addFoodTableAction,
  deleteFoodTableAction,
  updateFoodChannelsAction,
} from "@/app/actions/food-ops";
import { Button } from "@/components/ui/button";

type Table = { id: string; label: string; code: string; isActive: boolean };

export function FoodChannelsPanel({
  businessId,
  handle,
  dineInAllowed,
  modules,
  initial,
  tables: initialTables,
  appUrl,
}: {
  businessId: string;
  handle: string;
  dineInAllowed: boolean;
  modules: {
    pickup: boolean;
    delivery: boolean;
    dineIn: boolean;
  };
  initial: {
    pickupEnabled: boolean;
    deliveryEnabled: boolean;
    dineInEnabled: boolean;
    pickupInstructions: string | null;
    deliveryInstructions: string | null;
  };
  tables: Table[];
  appUrl: string;
}) {
  const router = useRouter();
  const [pickup, setPickup] = useState(initial.pickupEnabled && modules.pickup);
  const [delivery, setDelivery] = useState(initial.deliveryEnabled && modules.delivery);
  const [dineIn, setDineIn] = useState(initial.dineInEnabled && dineInAllowed && modules.dineIn);
  const [pickupInstr, setPickupInstr] = useState(initial.pickupInstructions ?? "");
  const [deliveryInstr, setDeliveryInstr] = useState(initial.deliveryInstructions ?? "");
  const [tables, setTables] = useState(initialTables);
  const [tableLabel, setTableLabel] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const base = appUrl.replace(/\/$/, "");
  const missingAny = !modules.pickup || !modules.delivery || (dineInAllowed && !modules.dineIn);

  return (
    <div className="mt-6 space-y-4">
      <div className="premium-card space-y-3 px-3 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Order channels</p>
        <p className="text-[11px] text-brand-muted">
          Layer 1 WhatsApp stays free. Pickup, delivery, and Restaurant Dine-in need the matching module under
          Billing → Select modules, then enable the channel here.
        </p>

        {missingAny ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
            Missing modules for some channels.{" "}
            <Link href="/billing" className="font-semibold underline">
              Select modules
            </Link>{" "}
            to unlock, then return here to turn channels on.
          </p>
        ) : null}

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={pickup}
            disabled={!modules.pickup}
            onChange={(e) => setPickup(e.target.checked)}
          />
          Pickup
          {!modules.pickup ? (
            <span className="text-[10px] text-amber-700">Needs food.pickup module</span>
          ) : null}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={delivery}
            disabled={!modules.delivery}
            onChange={(e) => setDelivery(e.target.checked)}
          />
          Delivery (your riders / partner — not Artix fleet)
          {!modules.delivery ? (
            <span className="text-[10px] text-amber-700">Needs food.delivery module</span>
          ) : null}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={dineIn}
            disabled={!dineInAllowed || !modules.dineIn}
            onChange={(e) => setDineIn(e.target.checked)}
          />
          Restaurant Dine-in (table QR)
          {!dineInAllowed ? (
            <span className="text-[10px] text-amber-700">Blocked for cloud / catering-only</span>
          ) : !modules.dineIn ? (
            <span className="text-[10px] text-amber-700">Needs food.dine_in module</span>
          ) : null}
        </label>
        {pickup ? (
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Pickup instructions"
            value={pickupInstr}
            onChange={(e) => setPickupInstr(e.target.value)}
          />
        ) : null}
        {delivery ? (
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Delivery area / notes"
            value={deliveryInstr}
            onChange={(e) => setDeliveryInstr(e.target.value)}
          />
        ) : null}
        <Button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const r = await updateFoodChannelsAction({
                businessId,
                pickupEnabled: pickup,
                deliveryEnabled: delivery,
                dineInEnabled: dineIn,
                pickupInstructions: pickupInstr,
                deliveryInstructions: deliveryInstr,
              });
              setMessage(r.success ? "Channels saved" : r.error ?? "Failed");
              router.refresh();
            })
          }
        >
          Save channels
        </Button>
      </div>

      {dineInAllowed && modules.dineIn && dineIn ? (
        <div className="premium-card space-y-3 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
            Floor tables · QR links
          </p>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              startTransition(async () => {
                const r = await addFoodTableAction(businessId, tableLabel);
                if (!r.success) {
                  setMessage(r.error ?? "Failed");
                  return;
                }
                setTableLabel("");
                setMessage(r.code ? `Table added · code ${r.code}` : "Table added");
                router.refresh();
              });
            }}
          >
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Table label e.g. T12"
              value={tableLabel}
              onChange={(e) => setTableLabel(e.target.value)}
            />
            <Button type="submit" disabled={isPending}>
              Add
            </Button>
          </form>
          <ul className="space-y-2 text-sm">
            {tables.map((t) => {
              const qrUrl = `${base}/${handle}/menu?table=${encodeURIComponent(t.code)}`;
              return (
                <li key={t.id} className="rounded-lg border px-3 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">
                        {t.label} <span className="font-mono text-xs text-brand-muted">{t.code}</span>
                      </p>
                      <p className="mt-0.5 break-all text-[10px] text-brand-muted">{qrUrl}</p>
                    </div>
                    <button
                      type="button"
                      className="text-[11px] font-semibold text-red-600"
                      disabled={isPending}
                      onClick={() =>
                        startTransition(async () => {
                          await deleteFoodTableAction(businessId, t.id);
                          setTables((xs) => xs.filter((x) => x.id !== t.id));
                        })
                      }
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="text-[10px] text-brand-muted">
            Print QR codes pointing to each URL (any QR generator). Guests open the menu with table context.
          </p>
        </div>
      ) : null}

      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  );
}
