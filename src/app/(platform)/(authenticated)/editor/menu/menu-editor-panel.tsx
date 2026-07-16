"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  addMenuItemAction,
  deleteMenuItemAction,
  seedFoodMenuAction,
  updateMenuItemAction,
} from "@/app/actions/food";
import { Button } from "@/components/ui/button";

type Item = {
  id: string;
  name: string;
  description: string | null;
  section: string;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
};

export function MenuEditorPanel({
  businessId,
  items: initial,
  handle,
}: {
  businessId: string;
  items: Item[];
  handle: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [name, setName] = useState("");
  const [section, setSection] = useState("Mains");
  const [price, setPrice] = useState(199);
  const [isVeg, setIsVeg] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mt-5 space-y-5">
      <div className="flex flex-wrap gap-2 text-xs">
        <Link
          href={`/${handle}/menu`}
          target="_blank"
          className="rounded-full bg-brand-mist px-3 py-1 font-semibold text-brand-ink"
        >
          Public menu ↗
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="premium-card px-4 py-6 text-center">
          <p className="text-sm font-semibold">No menu items yet</p>
          <p className="mt-1 text-xs text-brand-muted">Load a starter template or add your own.</p>
          <Button
            type="button"
            className="mt-4"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const r = await seedFoodMenuAction(businessId);
                setMessage(r.success ? (r.seeded ? "Template loaded" : "Already has items") : r.error ?? "Failed");
                router.refresh();
              })
            }
          >
            Load starter menu
          </Button>
        </div>
      ) : null}

      <form
        className="premium-card space-y-2 px-3 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const r = await addMenuItemAction({
              businessId,
              name,
              section,
              price,
              isVeg,
            });
            if (!r.success) {
              setMessage(r.error ?? "Failed");
              return;
            }
            setName("");
            setMessage("Item added");
            router.refresh();
          });
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Add item</p>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className="flex gap-2">
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Section"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          />
          <input
            className="w-24 rounded-lg border px-3 py-2 text-sm"
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </div>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={isVeg} onChange={(e) => setIsVeg(e.target.checked)} />
          Vegetarian
        </label>
        <Button type="submit" disabled={isPending || !name.trim()}>
          Add to menu
        </Button>
      </form>

      {message ? <p className="text-sm text-brand-ink">{message}</p> : null}

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="premium-card flex items-start justify-between gap-2 px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-semibold">
                {item.name}
                {!item.isAvailable ? (
                  <span className="ml-2 text-[10px] uppercase text-slate-400">Hidden</span>
                ) : null}
              </p>
              <p className="text-[11px] text-brand-muted">
                {item.section} · ₹{item.price} · {item.isVeg ? "Veg" : "Non-veg"}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              <button
                type="button"
                className="text-[11px] font-semibold text-brand-turquoise"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await updateMenuItemAction({
                      businessId,
                      itemId: item.id,
                      isAvailable: !item.isAvailable,
                    });
                    setItems((list) =>
                      list.map((i) =>
                        i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i,
                      ),
                    );
                  })
                }
              >
                {item.isAvailable ? "Hide" : "Show"}
              </button>
              <button
                type="button"
                className="text-[11px] font-semibold text-red-600"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await deleteMenuItemAction(businessId, item.id);
                    setItems((list) => list.filter((i) => i.id !== item.id));
                  })
                }
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
