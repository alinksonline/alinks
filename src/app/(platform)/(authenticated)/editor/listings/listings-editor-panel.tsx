"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  addPropertyListingAction,
  deletePropertyListingAction,
  updatePropertyListingAction,
  type ListingType,
  type ListingVisibility,
} from "@/app/actions/real-estate";
import { Button } from "@/components/ui/button";

type Listing = {
  id: string;
  title: string;
  listingType: string;
  visibility: string;
  city: string | null;
  priceLabel: string | null;
  isActive: boolean;
};

export function ListingsEditorPanel({
  businessId,
  handle,
  listings: initial,
}: {
  businessId: string;
  handle: string;
  listings: Listing[];
}) {
  const router = useRouter();
  const [listings, setListings] = useState(initial);
  const [title, setTitle] = useState("");
  const [listingType, setListingType] = useState<ListingType>("rent");
  const [visibility, setVisibility] = useState<ListingVisibility>("open");
  const [city, setCity] = useState("");
  const [priceLabel, setPriceLabel] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mt-5 space-y-5">
      <Link
        href={`/${handle}/listings`}
        target="_blank"
        className="inline-block rounded-full bg-brand-mist px-3 py-1 text-xs font-semibold"
      >
        Public listings ↗
      </Link>

      <form
        className="premium-card space-y-2 px-3 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const r = await addPropertyListingAction({
              businessId,
              title,
              listingType,
              visibility,
              city: city || undefined,
              priceLabel: priceLabel || undefined,
            });
            if (!r.success) {
              setMessage(r.error ?? "Failed");
              return;
            }
            setTitle("");
            setMessage("Listing added");
            router.refresh();
          });
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Add listing</p>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            className="rounded-lg border px-3 py-2 text-sm"
            value={listingType}
            onChange={(e) => setListingType(e.target.value as ListingType)}
          >
            <option value="sell">Sell</option>
            <option value="resale">Resale</option>
            <option value="rent">Rent</option>
            <option value="lease">Lease</option>
          </select>
          <select
            className="rounded-lg border px-3 py-2 text-sm"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as ListingVisibility)}
          >
            <option value="open">Open</option>
            <option value="teaser">Teaser</option>
            <option value="private">Private</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="Price label"
            value={priceLabel}
            onChange={(e) => setPriceLabel(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isPending || !title.trim()}>
          Add listing
        </Button>
      </form>

      {message ? <p className="text-sm">{message}</p> : null}

      <ul className="space-y-2">
        {listings.map((l) => (
          <li key={l.id} className="premium-card px-3 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">
                  {l.title}
                  {!l.isActive ? (
                    <span className="ml-2 text-[10px] uppercase text-slate-400">Hidden</span>
                  ) : null}
                </p>
                <p className="text-[11px] text-brand-muted">
                  {l.listingType} · {l.visibility}
                  {l.city ? ` · ${l.city}` : ""} · {l.priceLabel || "—"}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  className="text-[11px] font-semibold text-brand-turquoise"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      await updatePropertyListingAction({
                        businessId,
                        listingId: l.id,
                        isActive: !l.isActive,
                      });
                      setListings((xs) =>
                        xs.map((x) => (x.id === l.id ? { ...x, isActive: !x.isActive } : x)),
                      );
                    })
                  }
                >
                  {l.isActive ? "Hide" : "Show"}
                </button>
                <button
                  type="button"
                  className="text-[11px] font-semibold text-red-600"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      await deletePropertyListingAction(businessId, l.id);
                      setListings((xs) => xs.filter((x) => x.id !== l.id));
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
