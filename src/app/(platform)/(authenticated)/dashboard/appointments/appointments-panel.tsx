"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAppointmentStatusAction } from "@/app/actions/appointments";
import { formatSlotLabel } from "@/core/utils/appointment-slots";

type Appt = {
  bookingId: string;
  packageName: string;
  staffName: string | null;
  slotDate: string;
  slotTime: string;
  durationMinutes: number;
  price: number;
  paymentMode: string;
  paymentStatus: string;
  status: string;
  customerName: string;
  customerPhone: string;
};

export function AppointmentsPanel({
  businessId,
  appointments,
}: {
  businessId: string;
  appointments: Appt[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const setStatus = (bookingId: string, status: "confirmed" | "cancelled" | "completed" | "no_show") => {
    startTransition(async () => {
      await updateAppointmentStatusAction(businessId, bookingId, status);
      router.refresh();
    });
  };

  if (appointments.length === 0) {
    return (
      <div className="premium-card mt-5 px-4 py-8 text-center">
        <p className="text-sm font-semibold text-brand-ink">No upcoming appointments</p>
        <p className="mt-1 text-xs text-brand-muted">
          When clients book free or paid slots, they show up here.
        </p>
      </div>
    );
  }

  return (
    <ul className="mt-5 space-y-2">
      {appointments.map((a) => (
        <li key={a.bookingId} className="premium-card px-3 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-brand-ink">{a.packageName}</p>
              <p className="mt-0.5 text-xs text-brand-muted">
                {a.slotDate} · {formatSlotLabel(a.slotTime)} · {a.durationMinutes} min
              </p>
              <p className="mt-1 text-xs text-brand-ink">
                {a.customerName}
                {a.customerPhone ? ` · ${a.customerPhone}` : ""}
              </p>
              {a.staffName ? (
                <p className="mt-0.5 text-[11px] text-brand-muted">With {a.staffName}</p>
              ) : null}
            </div>
            <div className="shrink-0 text-right">
              <span className="rounded-full bg-brand-mist px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-ink">
                {a.status}
              </span>
              <p className="mt-1 text-[10px] text-brand-muted">
                {a.paymentMode} · {a.paymentStatus}
              </p>
              <p className="text-xs font-semibold text-brand-ink">₹{a.price}</p>
            </div>
          </div>
          {a.status === "confirmed" || a.status === "pending_payment" ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                type="button"
                disabled={isPending}
                className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800"
                onClick={() => setStatus(a.bookingId, "completed")}
              >
                Done
              </button>
              <button
                type="button"
                disabled={isPending}
                className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-900"
                onClick={() => setStatus(a.bookingId, "no_show")}
              >
                No-show
              </button>
              <button
                type="button"
                disabled={isPending}
                className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-800"
                onClick={() => setStatus(a.bookingId, "cancelled")}
              >
                Cancel
              </button>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
