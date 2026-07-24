"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  addStoreProductAction,
  deleteStoreProductAction,
  seedRetailProductsAction,
  updateStoreProductAction,
  updateTradeModeAction,
} from "@/app/actions/retail";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  mrp: number | null;
  category: string;
  brand: string | null;
  stock: number | null;
  isActive: boolean;
};

export function ProductsEditorPanel({
  businessId,
  handle,
  products: initial,
  tradeMode: initialTrade,
}: {
  businessId: string;
  handle: string;
  products: Product[];
  tradeMode: string;
}) {
  const router = useRouter();
  const [products, setProducts] = useState(initial);
  const [tradeMode, setTradeMode] = useState(initialTrade);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("General");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState(199);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mt-5 space-y-5">
      <div className="flex flex-wrap gap-2 text-xs">
        <Link
          href={`/${handle}/store`}
          target="_blank"
          className="rounded-full bg-brand-mist px-3 py-1 font-semibold"
        >
          Public shop ↗
        </Link>
        <Link href="/editor/commerce" className="rounded-full bg-brand-mist px-3 py-1 font-semibold">
          Checkout (COD / Razorpay)
        </Link>
      </div>

      <div className="premium-card px-3 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Trade mode</p>
        <p className="mt-1 text-[11px] text-brand-muted">
          Frozen labels: Retail only · Wholesale only · Both. Storefront MVP is retail unit sales.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(
            [
              ["retail", "Retail only"],
              ["wholesale", "Wholesale only"],
              ["both", "Retail + Wholesale"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              disabled={isPending}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                tradeMode === value ? "bg-brand-ink text-brand-cream" : "bg-brand-mist text-brand-muted"
              }`}
              onClick={() =>
                startTransition(async () => {
                  const r = await updateTradeModeAction(businessId, value);
                  if (!r.success) {
                    { const __e = r.error ?? "Failed"; setMessage(__e); toast.error(__e); }
                    return;
                  }
                  setTradeMode(value);
                  const ok =
                    value === "retail"
                      ? "Retail only — public shop shows unit prices."
                      : "Saved. Wholesale / hybrid storefront UI comes next; products still sell retail on site.";
                  setMessage(ok);
                  toast.success(ok);
                })
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="premium-card px-4 py-6 text-center">
          <p className="text-sm font-semibold">No products yet</p>
          <p className="mt-1 text-xs text-brand-muted">Load a starter catalog or add your own.</p>
          <Button
            type="button"
            className="mt-4"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const r = await seedRetailProductsAction(businessId);
                if (r.success) {
                  const ok = r.seeded ? "Catalog loaded" : "Already has products";
                  setMessage(ok);
                  toast.success(ok);
                } else {
                  const err = r.error ?? "Failed";
                  setMessage(err);
                  toast.error(err);
                }
                router.refresh();
              })
            }
          >
            Load starter products
          </Button>
        </div>
      ) : null}

      <form
        className="premium-card space-y-2 px-3 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const r = await addStoreProductAction({
              businessId,
              name,
              price,
              category,
              brand: brand || undefined,
            });
            if (!r.success) {
              { const __e = r.error ?? "Failed"; setMessage(__e); toast.error(__e); }
              return;
            }
            setName("");
            setMessage("Product added"); toast.success("Product added");
            router.refresh();
          });
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Add product</p>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="Brand (optional)"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
        </div>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
        <Button type="submit" disabled={isPending || !name.trim()}>
          Add product
        </Button>
      </form>

      {message ? <p className="text-sm text-brand-ink">{message}</p> : null}

      <ul className="space-y-2">
        {products.map((p) => (
          <li key={p.id} className="premium-card flex items-start justify-between gap-2 px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-semibold">
                {p.name}
                {!p.isActive ? (
                  <span className="ml-2 text-[10px] uppercase text-slate-400">Hidden</span>
                ) : null}
              </p>
              <p className="text-[11px] text-brand-muted">
                ₹{p.price}
                {p.mrp ? ` · MRP ₹${p.mrp}` : ""} · {p.category}
                {p.brand ? ` · ${p.brand}` : ""}
                {p.stock != null ? ` · stock ${p.stock}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              <button
                type="button"
                className="text-[11px] font-semibold text-brand-turquoise"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await updateStoreProductAction({
                      businessId,
                      productId: p.id,
                      isActive: !p.isActive,
                    });
                    setProducts((list) =>
                      list.map((x) => (x.id === p.id ? { ...x, isActive: !x.isActive } : x)),
                    );
                  })
                }
              >
                {p.isActive ? "Hide" : "Show"}
              </button>
              <button
                type="button"
                className="text-[11px] font-semibold text-red-600"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await deleteStoreProductAction(businessId, p.id);
                    setProducts((list) => list.filter((x) => x.id !== p.id));
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
