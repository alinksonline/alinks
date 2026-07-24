"use client";

import { useMemo, useState, useTransition } from "react";
import { submitVehicleLeadAction } from "@/app/actions/automotive";
import { whatsappUrl } from "@/core/utils/business-profile";

type Vehicle = {
  id: string;
  title: string;
  description: string | null;
  condition: string;
  visibility: string;
  make: string | null;
  model: string | null;
  year: number | null;
  fuel: string | null;
  kmDriven: number | null;
  priceLabel: string | null;
  city: string | null;
};

export function VehicleListingsPublic({
  handle,
  businessName,
  vehicles,
  whatsapp,
}: {
  handle: string;
  businessName: string;
  vehicles: Vehicle[];
  whatsapp?: string;
}) {
  const [filter, setFilter] = useState("all");
  const [leadVehicle, setLeadVehicle] = useState<Vehicle | null>(null);
  const [intent, setIntent] = useState<"buy" | "test_drive">("test_drive");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const conditions = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.condition))),
    [vehicles],
  );
  const filtered =
    filter === "all" ? vehicles : vehicles.filter((v) => v.condition === filter);

  if (!vehicles.length) {
    return (
      <div className="t-card px-4 py-10 text-center">
        <p className="t-ink text-sm font-semibold">No vehicles listed yet</p>
        <p className="t-muted mt-1 text-xs">Contact the dealer for current stock.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="t-muted mb-3 text-xs leading-relaxed">
        Showcase only — no online car purchase or financing on ALINKS. Deal offline (RC, loan,
        insurance).
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="t-slot-chip"
          data-selected={filter === "all" ? "true" : "false"}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        {conditions.map((c) => (
          <button
            key={c}
            type="button"
            className="t-slot-chip"
            data-selected={filter === c ? "true" : "false"}
            onClick={() => setFilter(c)}
          >
            {c.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {filtered.map((v) => {
          const waMsg = `Hi ${businessName}! Interested in: ${v.title}${v.year ? ` (${v.year})` : ""}`;
          const waHref = whatsapp
            ? whatsappUrl(whatsapp, waMsg)
            : `https://wa.me/?text=${encodeURIComponent(waMsg)}`;
          return (
            <article key={v.id} className="t-card p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="t-muted text-[10px] font-bold uppercase tracking-wider">
                    {v.condition}
                    {v.visibility === "teaser" ? " · teaser" : ""}
                  </p>
                  <h2 className="t-ink mt-0.5 text-sm font-bold">{v.title}</h2>
                  <p className="t-muted mt-0.5 text-xs">
                    {[v.make, v.model, v.year, v.fuel].filter(Boolean).join(" · ")}
                    {v.kmDriven != null ? ` · ${v.kmDriven.toLocaleString("en-IN")} km` : ""}
                    {v.city ? ` · ${v.city}` : ""}
                  </p>
                  {v.description ? (
                    <p className="t-muted mt-1.5 text-xs leading-relaxed">{v.description}</p>
                  ) : null}
                </div>
                <p
                  className="shrink-0 text-sm font-bold"
                  style={{ color: "var(--t-primary-text, var(--t-primary))" }}
                >
                  {v.priceLabel || "—"}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="t-btn-primary !min-h-9 !w-auto !px-4 text-xs"
                  onClick={() => {
                    setLeadVehicle(v);
                    setIntent("test_drive");
                    setStatus(null);
                  }}
                >
                  Test drive / buy interest
                </button>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full bg-[#25D366] px-4 py-2 text-xs font-bold text-white"
                >
                  WhatsApp
                </a>
              </div>
            </article>
          );
        })}
      </div>

      {leadVehicle ? (
        <div className="t-card mt-5 space-y-3 p-4">
          <p className="text-sm font-bold">Lead: {leadVehicle.title}</p>
          <p className="t-muted text-[11px]">
            Free enquiry — saved to dealer&apos;s sheet. No payment or car checkout here.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              className="t-slot-chip"
              data-selected={intent === "test_drive" ? "true" : "false"}
              onClick={() => setIntent("test_drive")}
            >
              Test drive
            </button>
            <button
              type="button"
              className="t-slot-chip"
              data-selected={intent === "buy" ? "true" : "false"}
              onClick={() => setIntent("buy")}
            >
              Buy interest
            </button>
          </div>
          <input
            className="t-input"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="t-input"
            placeholder="10-digit phone"
            inputMode="numeric"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          />
          <textarea
            className="t-input min-h-[72px]"
            placeholder="Message (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="t-btn-primary"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const r = await submitVehicleLeadAction({
                    handle,
                    vehicleId: leadVehicle.id,
                    vehicleTitle: leadVehicle.title,
                    name,
                    phone,
                    message,
                    intent,
                  });
                  if (!r.success) {
                    setStatus(r.error ?? "Failed");
                    return;
                  }
                  setStatus("Lead sent. The dealer will contact you.");
                  setName("");
                  setPhone("");
                  setMessage("");
                  setLeadVehicle(null);
                })
              }
            >
              Submit lead
            </button>
            <button type="button" className="text-xs font-semibold" onClick={() => setLeadVehicle(null)}>
              Cancel
            </button>
          </div>
          {status ? <p className="text-xs font-medium">{status}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
