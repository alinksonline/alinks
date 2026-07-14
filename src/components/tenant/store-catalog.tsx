"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Business } from "@/core/types/tenant";
import type { CatalogProduct } from "@/core/types/commerce";
import { whatsappUrl } from "@/core/utils/business-profile";

/**
 * Product/order cards — high contrast in light or dark tenant theme.
 * Uses CSS vars from TenantThemedLayout.
 */
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
  const itemCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  function addToCart(id: string) {
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  }

  function removeFromCart(id: string) {
    setCart((c) => {
      const next = { ...c };
      const q = (next[id] ?? 0) - 1;
      if (q <= 0) delete next[id];
      else next[id] = q;
      return next;
    });
  }

  const waPhone = business.profile?.whatsapp || business.profile?.phone || "";

  if (!products.length) {
    return (
      <div className="t-card mt-4 px-4 py-10 text-center">
        <p className="t-ink text-sm font-semibold">No items listed yet</p>
        <p className="t-muted mt-1 text-xs">Check back soon or message the shop on WhatsApp.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mt-4 grid gap-3 grid-cols-1">
        {products.map((p) => {
          const qty = cart[p.id] ?? 0;
          const orderMsg = `Hi, I want to order ${p.name} (₹${p.price}) from ${business.name}`;
          const waHref = waPhone
            ? whatsappUrl(waPhone, orderMsg)
            : `https://wa.me/?text=${encodeURIComponent(orderMsg)}`;

          return (
            <article key={p.id} className="t-card flex gap-3 p-3.5">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-lg font-bold"
                style={{
                  backgroundColor: "var(--t-primary-soft)",
                  color: "var(--t-primary)",
                }}
                aria-hidden
              >
                {p.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="t-ink text-sm font-bold tracking-tight">{p.name}</h2>
                    {p.category ? (
                      <p className="t-muted mt-0.5 text-[10px] font-medium uppercase tracking-wider">
                        {p.category}
                      </p>
                    ) : null}
                  </div>
                  <p className="shrink-0 text-sm font-bold" style={{ color: "var(--t-primary)" }}>
                    ₹{p.price}
                  </p>
                </div>

                {proCheckout ? (
                  <div className="mt-3 flex items-center gap-2">
                    {qty > 0 ? (
                      <div className="flex flex-1 items-center justify-between rounded-full border border-[var(--t-border)] bg-[var(--t-soft)] px-1 py-1">
                        <button
                          type="button"
                          onClick={() => removeFromCart(p.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                          style={{ color: "var(--t-primary)" }}
                          aria-label={`Remove one ${p.name}`}
                        >
                          −
                        </button>
                        <span className="t-ink text-sm font-bold">{qty}</span>
                        <button
                          type="button"
                          onClick={() => addToCart(p.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                          style={{ color: "var(--t-primary)" }}
                          aria-label={`Add one ${p.name}`}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addToCart(p.id)}
                        className="t-btn-primary !min-h-9 text-xs"
                      >
                        Add to cart
                      </button>
                    )}
                  </div>
                ) : (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-[#25D366] py-2.5 text-center text-xs font-bold text-white active:scale-[0.99]"
                  >
                    Order on WhatsApp
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {proCheckout && cartItems.length > 0 && (
        <div className="t-card sticky bottom-[4.5rem] z-30 mt-5 space-y-3 border-[var(--t-primary)] p-4 shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="t-ink text-sm font-bold">Your cart</h3>
              <p className="t-muted text-[11px]">
                {itemCount} item{itemCount === 1 ? "" : "s"}
              </p>
            </div>
            <p className="text-lg font-bold" style={{ color: "var(--t-primary)" }}>
              ₹{total}
            </p>
          </div>
          <ul className="space-y-1.5 border-t border-[var(--t-border)] pt-2 text-xs">
            {cartItems.map((i) => (
              <li key={i.id} className="flex justify-between gap-2">
                <span className="t-ink">
                  {i.name} × {i.qty}
                </span>
                <span className="t-muted">₹{i.price * i.qty}</span>
              </li>
            ))}
          </ul>
          <Link
            href={`/${business.handle}/checkout?cart=${encodeURIComponent(
              JSON.stringify(
                cartItems.map((i) => ({
                  productId: i.id,
                  name: i.name,
                  price: i.price,
                  qty: i.qty,
                })),
              ),
            )}`}
            className="t-btn-primary"
          >
            Proceed to checkout
          </Link>
        </div>
      )}
    </div>
  );
}
