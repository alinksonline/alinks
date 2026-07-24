"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Business } from "@/core/types/tenant";
import type { CatalogProduct } from "@/core/types/commerce";
import { whatsappUrl } from "@/core/utils/business-profile";

/**
 * Retail storefront — category/brand filters, WhatsApp order, optional cart checkout.
 * No multi-outlet POS.
 */
export function StoreCatalog({
  business,
  products,
  proCheckout,
  tradeMode = "retail",
}: {
  business: Business;
  products: CatalogProduct[];
  proCheckout: boolean;
  /** retail | wholesale | both — MVP storefront is B2C retail path */
  tradeMode?: string;
}) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");

  const categories = useMemo(() => {
    const s = new Set(products.map((p) => p.category).filter(Boolean) as string[]);
    return Array.from(s).sort();
  }, [products]);

  const brands = useMemo(() => {
    const s = new Set(products.map((p) => p.brand).filter(Boolean) as string[]);
    return Array.from(s).sort();
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (brandFilter !== "all" && p.brand !== brandFilter) return false;
      return true;
    });
  }, [products, categoryFilter, brandFilter]);

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

  const cartWaMessage = () => {
    const lines = cartItems.map((i) => `• ${i.name} × ${i.qty} = ₹${i.price * i.qty}`).join("\n");
    return `Hi ${business.name}! Order request:\n${lines}\n\nTotal: ₹${total}\nName:\nAddress:`;
  };

  if (!products.length) {
    return (
      <div className="t-card mt-4 px-4 py-10 text-center">
        <p className="t-ink text-sm font-semibold">No products listed yet</p>
        <p className="t-muted mt-1 text-xs">Check back soon or message the shop on WhatsApp.</p>
      </div>
    );
  }

  return (
    <div>
      {tradeMode === "wholesale" ? (
        <p className="t-muted mb-2 text-xs">
          Wholesale mode is stored for your account; this storefront shows unit prices (B2C). Bulk MOQ UI
          ships later.
        </p>
      ) : null}

      {/* Filters */}
      {categories.length > 1 || brands.length > 0 ? (
        <div className="mt-3 space-y-2">
          {categories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="t-slot-chip"
                data-selected={categoryFilter === "all" ? "true" : "false"}
                onClick={() => setCategoryFilter("all")}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="t-slot-chip"
                  data-selected={categoryFilter === c ? "true" : "false"}
                  onClick={() => setCategoryFilter(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          ) : null}
          {brands.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="t-slot-chip"
                data-selected={brandFilter === "all" ? "true" : "false"}
                onClick={() => setBrandFilter("all")}
              >
                All brands
              </button>
              {brands.map((b) => (
                <button
                  key={b}
                  type="button"
                  className="t-slot-chip"
                  data-selected={brandFilter === b ? "true" : "false"}
                  onClick={() => setBrandFilter(b)}
                >
                  {b}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 grid-cols-1">
        {filtered.map((p) => {
          const qty = cart[p.id] ?? 0;
          const orderMsg = `Hi, I want to order ${p.name}${p.brand ? ` (${p.brand})` : ""} — ₹${p.price} from ${business.name}`;
          const waHref = waPhone
            ? whatsappUrl(waPhone, orderMsg)
            : `https://wa.me/?text=${encodeURIComponent(orderMsg)}`;
          const outOfStock = p.stock != null && p.stock <= 0;

          return (
            <article key={p.id} className="t-card flex gap-3 p-3.5">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-lg font-bold"
                style={{
                  backgroundColor: "var(--t-primary-soft)",
                  color: "var(--t-primary-text, var(--t-primary))",
                }}
                aria-hidden
              >
                {p.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="t-ink text-sm font-bold tracking-tight">{p.name}</h2>
                    <p className="t-muted mt-0.5 text-[10px] font-medium uppercase tracking-wider">
                      {[p.category, p.brand].filter(Boolean).join(" · ")}
                    </p>
                    {p.description ? (
                      <p className="t-muted mt-1 text-xs leading-relaxed line-clamp-2">{p.description}</p>
                    ) : null}
                    {outOfStock ? (
                      <p className="mt-1 text-[10px] font-bold uppercase text-red-600">Out of stock</p>
                    ) : p.stock != null && p.stock <= 5 ? (
                      <p className="mt-1 text-[10px] font-medium text-amber-700">Only {p.stock} left</p>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className="text-sm font-bold"
                      style={{ color: "var(--t-primary-text, var(--t-primary))" }}
                    >
                      ₹{p.price}
                    </p>
                    {p.mrp != null && p.mrp > p.price ? (
                      <p className="t-muted text-[10px] line-through">₹{p.mrp}</p>
                    ) : null}
                  </div>
                </div>

                {proCheckout && !outOfStock ? (
                  <div className="mt-3 flex items-center gap-2">
                    {qty > 0 ? (
                      <div className="flex flex-1 items-center justify-between rounded-full border border-[var(--t-border)] bg-[var(--t-soft)] px-1 py-1">
                        <button
                          type="button"
                          onClick={() => removeFromCart(p.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                          style={{ color: "var(--t-primary-text, var(--t-primary))" }}
                          aria-label={`Remove one ${p.name}`}
                        >
                          −
                        </button>
                        <span className="t-ink text-sm font-bold">{qty}</span>
                        <button
                          type="button"
                          onClick={() => addToCart(p.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                          style={{ color: "var(--t-primary-text, var(--t-primary))" }}
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
                ) : !outOfStock ? (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-[#25D366] py-2.5 text-center text-xs font-bold text-white active:scale-[0.99]"
                  >
                    Order on WhatsApp
                  </a>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="t-muted mt-4 text-center text-sm">No products in this filter.</p>
      ) : null}

      {proCheckout && cartItems.length > 0 && (
        <div className="t-card sticky bottom-[4.5rem] z-30 mt-5 space-y-3 border-[var(--t-primary)] p-4 shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="t-ink text-sm font-bold">Your cart</h3>
              <p className="t-muted text-[11px]">
                {itemCount} item{itemCount === 1 ? "" : "s"} · COD / UPI at checkout
              </p>
            </div>
            <p className="text-lg font-bold" style={{ color: "var(--t-primary-text, var(--t-primary))" }}>
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
          {waPhone ? (
            <a
              href={whatsappUrl(waPhone, cartWaMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs font-semibold text-[#128C7E]"
            >
              Or send cart on WhatsApp
            </a>
          ) : null}
        </div>
      )}
    </div>
  );
}
