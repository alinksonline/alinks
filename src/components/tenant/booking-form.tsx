"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeDevBookingPaymentAction, createBookingAction } from "@/app/actions/salon";

export function BookingForm({
  handle,
  packages,
  devMode,
}: {
  handle: string;
  packages: { id: string; name: string; price: number; durationMinutes: number; description: string | null }[];
  devMode: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [packageId, setPackageId] = useState(packages[0]?.id ?? "");
  const [slotDate, setSlotDate] = useState("");
  const [slotTime, setSlotTime] = useState("10:00");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [payNow, setPayNow] = useState(true);
  const [message, setMessage] = useState("");

  const selected = packages.find((p) => p.id === packageId);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await createBookingAction({
            handle,
            packageId,
            slotDate,
            slotTime,
            customerName: name,
            customerPhone: phone,
            payNow,
          });

          if (!result.success) {
            setMessage(result.error);
            return;
          }

          if (!payNow || !result.devMode) {
            setMessage(`Booking confirmed! ID: ${result.bookingId}`);
            router.push(`/${handle}`);
            return;
          }

          if (result.devMode && result.pendingBooking && result.sessionId) {
            const paid = await completeDevBookingPaymentAction({
              sessionId: result.sessionId,
              pendingBooking: result.pendingBooking,
            });
            if (paid.success) {
              setMessage(`Paid & booked! ID: ${paid.bookingId}`);
              router.push(`/${handle}`);
            } else {
              setMessage(paid.error);
            }
          }
        });
      }}
    >
      <select className="w-full rounded-lg border px-3 py-2" value={packageId} onChange={(e) => setPackageId(e.target.value)}>
        {packages.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} — ₹{p.price} ({p.durationMinutes} min)
          </option>
        ))}
      </select>

      {selected?.description && <p className="text-sm text-slate-600">{selected.description}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <input type="date" className="rounded-lg border px-3 py-2" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} required />
        <input type="time" className="rounded-lg border px-3 py-2" value={slotTime} onChange={(e) => setSlotTime(e.target.value)} required />
      </div>

      <input className="w-full rounded-lg border px-3 py-2" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
      <input className="w-full rounded-lg border px-3 py-2" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={payNow} onChange={(e) => setPayNow(e.target.checked)} />
        Pay now {devMode && "(UPI simulated)"} before confirming slot
      </label>

      <button type="submit" disabled={isPending || !packageId} className="w-full rounded-lg bg-pink-600 py-3 font-bold text-white disabled:opacity-50">
        {isPending ? "Booking…" : payNow ? `Pay ₹${selected?.price ?? 0} & book` : "Book slot"}
      </button>

      {message && <p className="text-sm text-slate-700">{message}</p>}
    </form>
  );
}