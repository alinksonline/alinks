"use client";

import { useTransition } from "react";
import { seedSalonPackagesAction } from "@/app/actions/salon";
import { Button } from "@/components/ui/button";

export function PackagesPanel({
  businessId,
  packages,
}: {
  businessId: string;
  packages: { id: string; name: string; price: number; durationMinutes: number; category: string }[];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mt-6">
      {packages.length === 0 ? (
        <Button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(async () => { await seedSalonPackagesAction(businessId); })}
        >
          Load 12 package templates
        </Button>
      ) : (
        <ul className="space-y-2 text-sm">
          {packages.map((p) => (
            <li key={p.id} className="rounded-lg border bg-white px-3 py-2">
              <span className="font-semibold">{p.name}</span>
              <span className="ml-2 text-slate-600">₹{p.price} · {p.durationMinutes} min · {p.category}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}