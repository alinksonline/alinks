"use client";

import { useMemo, useState } from "react";
import type { Business } from "@/core/types/tenant";
import { whatsappUrl } from "@/core/utils/business-profile";

export type MenuItemPublic = {
  id: string;
  name: string;
  description: string | null;
  section: string;
  price: number;
  isVeg: boolean;
};

/**
 * Food Layer 1 — digital menu + WhatsApp order (no cart / no tenant checkout).
 */
export function MenuCatalog({
  business,
  items,
  catalogLabel = "Menu",
}: {
  business: Business;
  items: MenuItemPublic[];
  catalogLabel?: string;
}) {
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const waPhone = business.profile?.whatsapp || business.profile?.phone || "";

  const sections = useMemo(() => {
    const set = new Set(items.map((i) => i.section));
    return Array.from(set);
  }, [items]);

  const filtered =
    sectionFilter === "all" ? items : items.filter((i) => i.section === sectionFilter);

  const buildOrderMessage = (item?: MenuItemPublic) => {
    if (item) {
      if (item.price <= 0) {
        return `Hi ${business.name}! Enquiry about: ${item.name}. Date / headcount:`;
      }
      return `Hi ${business.name}! I want to order:\n• ${item.name} — ₹${item.price}\n\nName:\nAddress / pickup:`;
    }
    const lines = filtered
      .slice(0, 8)
      .map((i) => `• ${i.name}${i.price > 0 ? ` (₹${i.price})` : ""}`)
      .join("\n");
    return `Hi ${business.name}! I'd like to order from your ${catalogLabel.toLowerCase()}:\n${lines}\n\nName:\nAddress / pickup:`;
  };

  const generalWa = waPhone
    ? whatsappUrl(waPhone, buildOrderMessage())
    : `https://wa.me/?text=${encodeURIComponent(buildOrderMessage())}`;

  if (!items.length) {
    return (
      <div className="t-card mt-4 px-4 py-10 text-center">
        <p className="t-ink text-sm font-semibold">Menu coming soon</p>
        <p className="t-muted mt-1 text-xs">Message us on WhatsApp for today&apos;s specials.</p>
        {waPhone ? (
          <a href={generalWa} target="_blank" rel="noopener noreferrer" className="t-btn-primary mt-4">
            WhatsApp us
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="t-slot-chip"
          data-selected={sectionFilter === "all" ? "true" : "false"}
          onClick={() => setSectionFilter("all")}
        >
          All
        </button>
        {sections.map((s) => (
          <button
            key={s}
            type="button"
            className="t-slot-chip"
            data-selected={sectionFilter === s ? "true" : "false"}
            onClick={() => setSectionFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2.5">
        {filtered.map((item) => {
          const msg = buildOrderMessage(item);
          const href = waPhone
            ? whatsappUrl(waPhone, msg)
            : `https://wa.me/?text=${encodeURIComponent(msg)}`;
          return (
            <article key={item.id} className="t-card flex gap-3 p-3.5">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  backgroundColor: item.isVeg ? "rgba(22,163,74,0.15)" : "rgba(220,38,38,0.12)",
                  color: item.isVeg ? "#15803d" : "#b91c1c",
                }}
                title={item.isVeg ? "Veg" : "Non-veg"}
                aria-label={item.isVeg ? "Vegetarian" : "Non-vegetarian"}
              >
                {item.isVeg ? "V" : "N"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="t-ink text-sm font-bold tracking-tight">{item.name}</h2>
                    <p className="t-muted mt-0.5 text-[10px] font-medium uppercase tracking-wider">
                      {item.section}
                    </p>
                    {item.description ? (
                      <p className="t-muted mt-1 text-xs leading-relaxed">{item.description}</p>
                    ) : null}
                  </div>
                  <p
                    className="shrink-0 text-sm font-bold"
                    style={{ color: "var(--t-primary-text, var(--t-primary))" }}
                  >
                    {item.price > 0 ? `₹${item.price}` : "Quote"}
                  </p>
                </div>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex rounded-full px-3 py-1.5 text-[11px] font-bold text-white"
                  style={{ backgroundColor: "var(--t-primary, #0f172a)" }}
                >
                  {item.price > 0 ? "Order on WhatsApp" : "Enquire on WhatsApp"}
                </a>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6 t-card p-4 text-center">
        <p className="t-ink text-sm font-semibold">Order on WhatsApp</p>
        <p className="t-muted mt-1 text-xs leading-relaxed">
          Browse the {catalogLabel.toLowerCase()}, then message us — no app download, no cart checkout on this
          site.
        </p>
        <a href={generalWa} target="_blank" rel="noopener noreferrer" className="t-btn-primary mt-3">
          Open WhatsApp with list
        </a>
      </div>
    </div>
  );
}
