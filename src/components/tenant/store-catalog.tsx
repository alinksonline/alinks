"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Business } from "@/core/types/tenant";
import type { CatalogProduct } from "@/core/types/commerce";
import { whatsappUrl } from "@/core/utils/business-profile";

/**
 * Product/order cards — always high contrast in light or dark tenant theme.
 * Uses CSS vars from TenantThemedLayout with solid fallbacks (never light-on-white).
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

  function addToCart(id: string) {
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  }

  const ink = "var(--t-ink, #0f172a)";
  const muted = "var(--t-muted, #64748b)";
  const surface = "var(--t-surface, #ffffff)";
  const border = "var(--t-border, rgba(15, 23, 42, 0.12))";
  const soft = "var(--t-soft, rgba(15, 23, 42, 0.06))";
  const primary = "var(--t-primary, #0f172a)";
  const onPrimary = "var(--t-on-primary, #ffffff)";
  const radius = "var(--t-radius, 14px)";
  const radiusSm = "var(--t-radius-sm, 10px)";

  const waPhone = business.profile?.whatsapp || business.profile?.phone || "";

  if (!products.length) {
    return (
      <div
        className="mt-4 px-3 py-8 text-center text-sm"
        style={{
          backgroundColor: surface,
          color: muted,
          borderRadius: radius,
          border: `1px solid ${border}`,
        }}
      >
        No items listed yet.
      </div>
    );
  }

  return (
    <div>
      <div className="mt-3 grid gap-3 grid-cols-1 sm:grid-cols-2">
        {products.map((p) => {
          const orderMsg = `Hi, I want to order ${p.name} (₹${p.price}) from ${business.name}`;
          const waHref = waPhone
            ? whatsappUrl(waPhone, orderMsg)
            : `https://wa.me/?text=${encodeURIComponent(orderMsg)}`;

          return (
            <article
              key={p.id}
              className="flex flex-col p-3.5"
              style={{
                backgroundColor: surface,
                color: ink,
                borderRadius: radius,
                border: `1px solid ${border}`,
                boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 6px 16px -10px rgba(0,0,0,0.1)",
              }}
            >
              <h2 className="text-sm font-bold tracking-tight" style={{ color: ink }}>
                {p.name}
              </h2>
              <p className="mt-1 text-base font-bold" style={{ color: primary }}>
                ₹{p.price}
              </p>
              {proCheckout ? (
                <button
                  type="button"
                  onClick={() => addToCart(p.id)}
                  className="mt-3 w-full py-2.5 text-center text-xs font-bold active:scale-[0.99]"
                  style={{
                    backgroundColor: primary,
                    color: onPrimary,
                    borderRadius: radiusSm,
                  }}
                >
                  Add to cart
                </button>
              ) : (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block w-full py-2.5 text-center text-xs font-bold text-white active:scale-[0.99]"
                  style={{
                    backgroundColor: "#25D366",
                    borderRadius: radiusSm,
                  }}
                >
                  Order on WhatsApp
                </a>
              )}
            </article>
          );
        })}
      </div>

      {proCheckout && cartItems.length > 0 && (
        <div
          className="mt-6 p-3.5"
          style={{
            backgroundColor: soft,
            borderRadius: radius,
            border: `1px solid ${border}`,
            color: ink,
          }}
        >
          <h3 className="text-sm font-bold" style={{ color: ink }}>
            Cart ({cartItems.length} items)
          </h3>
          <ul className="mt-2 space-y-1 text-xs" style={{ color: muted }}>
            {cartItems.map((i) => (
              <li key={i.id} style={{ color: ink }}>
                {i.name} × {i.qty} — ₹{i.price * i.qty}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm font-bold" style={{ color: ink }}>
            Total: ₹{total}
          </p>
          <Link
            href={`/${business.handle}/checkout?cart=${encodeURIComponent(JSON.stringify(cartItems.map((i) => ({ productId: i.id, name: i.name, price: i.price, qty: i.qty }))))}`}
            className="mt-3 inline-flex w-full items-center justify-center py-2.5 text-center text-xs font-bold text-white"
            style={{ backgroundColor: "#25D366", borderRadius: radiusSm }}
          >
            Proceed to checkout
          </Link>
        </div>
      )}
    </div>
  );
}
