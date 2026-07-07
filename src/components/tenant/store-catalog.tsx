"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Business } from "@/core/types/tenant";
import type { CatalogProduct } from "@/core/types/commerce";

export function StoreCatalog({
  business,
  products,
  proCheckout,
}: {
  business: Business;
  products: CatalogProduct[];
  proCheckout: boolean;
}) {
  const [cart, setCart] = useState<Record<string, number>>({});

  const cartItems = useMemo(() => {
    return products
      .filter((p) => (cart[p.id] ?? 0) > 0)
      .map((p) => ({ ...p, qty: cart[p.id] }));
  }, [cart, products]);

  const total = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  function addToCart(id: string) {
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        {products.map((p) => (
          <article key={p.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <h2 className="font-semibold">{p.name}</h2>
            <p className="mt-1 text-slate-600">₹{p.price}</p>
            {proCheckout ? (
              <button
                type="button"
                onClick={() => addToCart(p.id)}
                className="mt-3 w-full rounded-lg bg-slate-900 py-2.5 text-sm font-bold text-white"
              >
                Add to cart
              </button>
            ) : (
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Hi, I want to order ${p.name} from ${business.name}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block w-full rounded-lg bg-emerald-600 py-2.5 text-center text-sm font-bold text-white"
              >
                Order on WhatsApp
              </a>
            )}
          </article>
        ))}
      </div>

      {proCheckout && cartItems.length > 0 && (
        <div className="mt-8 rounded-xl border bg-slate-50 p-4">
          <h3 className="font-semibold">Cart ({cartItems.length} items)</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {cartItems.map((i) => (
              <li key={i.id}>
                {i.name} × {i.qty} — ₹{i.price * i.qty}
              </li>
            ))}
          </ul>
          <p className="mt-3 font-bold">Total: ₹{total}</p>
          <Link
            href={`/${business.handle}/checkout?cart=${encodeURIComponent(JSON.stringify(cartItems.map((i) => ({ productId: i.id, name: i.name, price: i.price, qty: i.qty }))))}`}
            className="mt-4 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white"
          >
            Proceed to checkout
          </Link>
        </div>
      )}
    </div>
  );
}