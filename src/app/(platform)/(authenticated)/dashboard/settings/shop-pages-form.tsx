"use client";

import { useState, useTransition } from "react";
import { updateShopCatalogSettingsAction } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import type { CatalogMode } from "@/core/utils/catalog-mode";

export function ShopPagesForm({
  catalogMode,
  deliveryOps,
  deliveryPartnerName,
}: {
  catalogMode: CatalogMode;
  deliveryOps: "manual" | "third_party";
  deliveryPartnerName: string;
}) {
  const [mode, setMode] = useState<CatalogMode>(catalogMode);
  const [ops, setOps] = useState<"manual" | "third_party">(deliveryOps);
  const [partner, setPartner] = useState(deliveryPartnerName);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const r = await updateShopCatalogSettingsAction({
            catalogMode: mode,
            deliveryOps: ops,
            deliveryPartnerName: partner,
          });
          if (r.success) toast.success("Shop pages and delivery saved");
          else toast.error(r.error ?? "Could not save");
        });
      }}
    >
      <div>
        <p className="text-xs font-semibold text-brand-ink">Public pages</p>
        <p className="mt-0.5 text-[11px] text-brand-muted">
          Your customers see these on your mini-site. ALINKS itself does not sell products.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(
            [
              ["products", "Products only"],
              ["services", "Services only"],
              ["both", "Products and Services"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                mode === value ? "bg-brand-ink text-brand-cream" : "bg-brand-mist text-brand-muted"
              }`}
              onClick={() => setMode(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-brand-ink">Delivery updates</p>
        <p className="mt-0.5 text-[11px] text-brand-muted">
          Mark status yourself, or record a third-party courier (Porter, Dunzo, Shiprocket, etc.).
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <button
            type="button"
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
              ops === "manual" ? "bg-brand-ink text-brand-cream" : "bg-brand-mist text-brand-muted"
            }`}
            onClick={() => setOps("manual")}
          >
            Manual
          </button>
          <button
            type="button"
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
              ops === "third_party" ? "bg-brand-ink text-brand-cream" : "bg-brand-mist text-brand-muted"
            }`}
            onClick={() => setOps("third_party")}
          >
            Third-party courier
          </button>
        </div>
        {ops === "third_party" ? (
          <input
            className="premium-input mt-2 text-sm"
            placeholder="Partner name (e.g. Porter, Dunzo, Shiprocket)"
            value={partner}
            onChange={(e) => setPartner(e.target.value)}
          />
        ) : null}
      </div>

      <Button type="submit" variant="secondary" disabled={isPending}>
        Save shop settings
      </Button>
    </form>
  );
}
