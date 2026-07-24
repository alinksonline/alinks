"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { seedSalonPackagesAction, updateSalonPackageAction } from "@/app/actions/salon";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import type { PackagePaymentMode } from "@/tenant/appointments/service";

type Pkg = {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  category: string;
  paymentMode?: string | null;
  isActive?: boolean;
};

const MODE_LABELS: Record<PackagePaymentMode, string> = {
  free: "Free booking",
  pay_at_salon: "Pay at salon",
  pay_then_book: "Pay then book",
};

export function PackagesPanel({
  businessId,
  packages: initial,
  razorpayConnected = false,
  payThenBookModule = false,
}: {
  businessId: string;
  packages: Pkg[];
  razorpayConnected?: boolean;
  /** Salon paid module sb.pay_then_book (Select modules). */
  payThenBookModule?: boolean;
}) {
  const [packages, setPackages] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const saveMode = (pkg: Pkg, paymentMode: PackagePaymentMode) => {
    setMessage(null);
    startTransition(async () => {
      const res = await updateSalonPackageAction({
        businessId,
        packageId: pkg.id,
        paymentMode,
      });
      if (!res.success) {
        { const __e = res.error ?? "Could not update"; setMessage(__e); toast.error(__e); }
        return;
      }
      setPackages((list) => list.map((p) => (p.id === pkg.id ? { ...p, paymentMode } : p)));
      setMessage(`Updated ${pkg.name} → ${MODE_LABELS[paymentMode]}`);
    });
  };

  const toggleActive = (pkg: Pkg) => {
    const next = !(pkg.isActive !== false);
    startTransition(async () => {
      const res = await updateSalonPackageAction({
        businessId,
        packageId: pkg.id,
        isActive: next,
      });
      if (!res.success) {
        { const __e = res.error ?? "Could not update"; setMessage(__e); toast.error(__e); }
        return;
      }
      setPackages((list) => list.map((p) => (p.id === pkg.id ? { ...p, isActive: next } : p)));
    });
  };

  return (
    <div className="mt-6">
      <p className="mb-3 text-xs text-brand-muted">
        Per package: free booking, pay at salon, or pay-then-book (needs Razorpay under Checkout). Soft hold
        is 15 minutes while the client pays.
      </p>

      {!payThenBookModule ? (
        <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
          Pay then book needs the <strong>Pay then book</strong> module.{" "}
          <Link href="/billing" className="font-semibold underline">
            Select modules
          </Link>
        </p>
      ) : !razorpayConnected ? (
        <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
          Razorpay not connected — pay-then-book is locked.{" "}
          <Link href="/editor/commerce" className="font-semibold underline">
            Connect Checkout
          </Link>
        </p>
      ) : null}

      {message ? <p className="mb-3 text-sm text-brand-ink">{message}</p> : null}

      {packages.length === 0 ? (
        <Button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await seedSalonPackagesAction(businessId);
              window.location.reload();
            })
          }
        >
          Load 12 package templates
        </Button>
      ) : (
        <ul className="space-y-3 text-sm">
          {packages.map((p) => {
            const mode = (p.paymentMode || "pay_at_salon") as PackagePaymentMode;
            const active = p.isActive !== false;
            return (
              <li key={p.id} className="rounded-xl border border-brand-ink/10 bg-white px-3 py-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-brand-ink">
                      {p.name}
                      {!active ? (
                        <span className="ml-2 text-[10px] font-bold uppercase text-slate-400">Hidden</span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-xs text-brand-muted">
                      ₹{p.price} · {p.durationMinutes} min · {p.category}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-[11px] font-semibold text-brand-turquoise"
                    disabled={isPending}
                    onClick={() => toggleActive(p)}
                  >
                    {active ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(Object.keys(MODE_LABELS) as PackagePaymentMode[]).map((m) => {
                    const lockedModule = m === "pay_then_book" && !payThenBookModule;
                    const lockedGateway = m === "pay_then_book" && payThenBookModule && !razorpayConnected;
                    const locked = lockedModule || lockedGateway;
                    return (
                      <button
                        key={m}
                        type="button"
                        disabled={isPending || locked}
                        onClick={() => saveMode(p, m)}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                          mode === m
                            ? "bg-brand-ink text-brand-cream"
                            : "bg-brand-mist text-brand-muted"
                        } disabled:opacity-40`}
                        title={
                          lockedModule
                            ? "Add Pay then book under Billing → Select modules"
                            : lockedGateway
                              ? "Connect Razorpay first"
                              : MODE_LABELS[m]
                        }
                      >
                        {MODE_LABELS[m]}
                      </button>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
