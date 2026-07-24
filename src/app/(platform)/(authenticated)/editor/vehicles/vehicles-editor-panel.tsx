"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  addVehicleListingAction,
  deleteVehicleListingAction,
  updateVehicleListingAction,
  type VehicleCondition,
  type VehicleVisibility,
} from "@/app/actions/automotive";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

type Vehicle = {
  id: string;
  title: string;
  condition: string;
  visibility: string;
  make: string | null;
  priceLabel: string | null;
  isActive: boolean;
};

export function VehiclesEditorPanel({
  businessId,
  handle,
  vehicles: initial,
}: {
  businessId: string;
  handle: string;
  vehicles: Vehicle[];
}) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState(initial);
  const [title, setTitle] = useState("");
  const [condition, setCondition] = useState<VehicleCondition>("used");
  const [visibility, setVisibility] = useState<VehicleVisibility>("open");
  const [make, setMake] = useState("");
  const [priceLabel, setPriceLabel] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mt-5 space-y-5">
      <Link
        href={`/${handle}/vehicles`}
        target="_blank"
        className="inline-block rounded-full bg-brand-mist px-3 py-1 text-xs font-semibold"
      >
        Public inventory ↗
      </Link>

      <form
        className="premium-card space-y-2 px-3 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const r = await addVehicleListingAction({
              businessId,
              title,
              condition,
              visibility,
              make: make || undefined,
              priceLabel: priceLabel || undefined,
            });
            if (!r.success) {
              { const __e = r.error ?? "Failed"; setMessage(__e); toast.error(__e); }
              return;
            }
            setTitle("");
            setMessage("Vehicle added"); toast.success("Vehicle added");
            router.refresh();
          });
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Add vehicle</p>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Title e.g. 2019 Swift VXI"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            className="rounded-lg border px-3 py-2 text-sm"
            value={condition}
            onChange={(e) => setCondition(e.target.value as VehicleCondition)}
          >
            <option value="used">Used</option>
            <option value="new">New</option>
            <option value="two_wheeler">Two-wheeler</option>
          </select>
          <select
            className="rounded-lg border px-3 py-2 text-sm"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as VehicleVisibility)}
          >
            <option value="open">Open</option>
            <option value="teaser">Teaser</option>
            <option value="private">Private</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="Make"
            value={make}
            onChange={(e) => setMake(e.target.value)}
          />
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="Price label"
            value={priceLabel}
            onChange={(e) => setPriceLabel(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isPending || !title.trim()}>
          Add vehicle
        </Button>
      </form>

      {message ? <p className="text-sm">{message}</p> : null}

      <ul className="space-y-2">
        {vehicles.map((v) => (
          <li key={v.id} className="premium-card px-3 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">
                  {v.title}
                  {!v.isActive ? (
                    <span className="ml-2 text-[10px] uppercase text-slate-400">Hidden</span>
                  ) : null}
                </p>
                <p className="text-[11px] text-brand-muted">
                  {v.condition} · {v.visibility}
                  {v.make ? ` · ${v.make}` : ""} · {v.priceLabel || "—"}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  className="text-[11px] font-semibold text-brand-turquoise"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      await updateVehicleListingAction({
                        businessId,
                        listingId: v.id,
                        isActive: !v.isActive,
                      });
                      setVehicles((xs) =>
                        xs.map((x) => (x.id === v.id ? { ...x, isActive: !x.isActive } : x)),
                      );
                    })
                  }
                >
                  {v.isActive ? "Hide" : "Show"}
                </button>
                <button
                  type="button"
                  className="text-[11px] font-semibold text-red-600"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      await deleteVehicleListingAction(businessId, v.id);
                      setVehicles((xs) => xs.filter((x) => x.id !== v.id));
                    })
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
