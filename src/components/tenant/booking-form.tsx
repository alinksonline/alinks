"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeDevBookingPaymentAction, createBookingAction } from "@/app/actions/salon";
import { openRazorpayCheckout, verifyPaymentViaApi } from "@/lib/razorpay-checkout";

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";

const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
];

function formatSlotLabel(hhmm: string) {
  const [hStr, m] = hhmm.split(":");
  const h = Number(hStr);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m} ${ampm}`;
}

function todayIsoDate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

type PackageOption = {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description: string | null;
};

export function BookingForm({
  handle,
  packages,
  devMode,
}: {
  handle: string;
  packages: PackageOption[];
  devMode: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [packageId, setPackageId] = useState(packages[0]?.id ?? "");
  const [slotDate, setSlotDate] = useState(todayIsoDate());
  const [slotTime, setSlotTime] = useState("10:00");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [payNow, setPayNow] = useState(true);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"error" | "success" | "info">("info");

  const selected = useMemo(
    () => packages.find((p) => p.id === packageId) ?? packages[0],
    [packageId, packages],
  );

  function setStatus(text: string, tone: "error" | "success" | "info" = "info") {
    setMessage(text);
    setMessageTone(tone);
  }

  return (
    <form
      className="space-y-6"
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
            setStatus(result.error, "error");
            return;
          }

          if (!payNow) {
            setStatus(`Booking confirmed! ID: ${result.bookingId}`, "success");
            router.push(`/${handle}`);
            return;
          }

          if (result.devMode && result.pendingBooking && result.sessionId) {
            const paid = await completeDevBookingPaymentAction({
              sessionId: result.sessionId,
              pendingBooking: result.pendingBooking,
            });
            if (paid.success) {
              setStatus(`Paid & booked! ID: ${paid.bookingId}`, "success");
              router.push(`/${handle}`);
            } else {
              setStatus(paid.error, "error");
            }
            return;
          }

          if (!RAZORPAY_KEY_ID) {
            setStatus("Payment gateway is not configured on the client.", "error");
            return;
          }

          if (!result.razorpayOrderId || !result.sessionId || !result.pendingBooking) {
            setStatus("Could not start payment. Try again.", "error");
            return;
          }

          try {
            await openRazorpayCheckout({
              keyId: RAZORPAY_KEY_ID,
              orderId: result.razorpayOrderId,
              amountPaise: result.amountPaise,
              name: result.businessName ?? "ALINKS Salon",
              description: selected?.name ?? "Salon booking",
              prefill: { name, contact: phone },
              onDismiss: () => setStatus("Payment cancelled.", "info"),
              onFailure: (err) => setStatus(err, "error"),
              onSuccess: async (payment) => {
                const verified = await verifyPaymentViaApi({
                  razorpay_order_id: payment.razorpay_order_id,
                  razorpay_payment_id: payment.razorpay_payment_id,
                  razorpay_signature: payment.razorpay_signature,
                  sessionId: result.sessionId,
                  pendingBooking: result.pendingBooking,
                });

                if (!verified.success) {
                  setStatus(verified.error ?? "Payment verification failed", "error");
                  return;
                }

                setStatus(`Paid & booked! ID: ${verified.bookingId ?? result.bookingId}`, "success");
                router.push(`/${handle}`);
              },
            });
          } catch (err) {
            setStatus(err instanceof Error ? err.message : "Could not open payment", "error");
          }
        });
      }}
    >
      {/* Package picker */}
      <section>
        <p className="t-label">Choose a package</p>
        <div className="mt-2 space-y-2.5">
          {packages.map((p) => {
            const selectedPkg = p.id === packageId;
            return (
              <button
                key={p.id}
                type="button"
                className="t-package-card"
                data-selected={selectedPkg ? "true" : "false"}
                onClick={() => setPackageId(p.id)}
                aria-pressed={selectedPkg}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold tracking-tight">{p.name}</p>
                    {p.description ? (
                      <p className="t-muted mt-0.5 text-xs leading-relaxed">{p.description}</p>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold" style={{ color: "var(--t-primary-text, var(--t-primary))" }}>
                      ₹{p.price}
                    </p>
                    <p className="t-muted text-[10px] font-medium">{p.durationMinutes} min</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Date + time */}
      <section className="space-y-4">
        <div className="t-input-group">
          <label className="t-label" htmlFor="booking-date">
            Date
          </label>
          <input
            id="booking-date"
            type="date"
            className="t-input"
            value={slotDate}
            min={todayIsoDate()}
            onChange={(e) => setSlotDate(e.target.value)}
            required
          />
        </div>

        <div>
          <p className="t-label">Time slot</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TIME_SLOTS.map((t) => (
              <button
                key={t}
                type="button"
                className="t-slot-chip"
                data-selected={slotTime === t ? "true" : "false"}
                onClick={() => setSlotTime(t)}
                aria-pressed={slotTime === t}
              >
                {formatSlotLabel(t)}
              </button>
            ))}
          </div>
          {/* Keep a real time input for accessibility / custom times */}
          <input type="hidden" name="slotTime" value={slotTime} />
        </div>
      </section>

      {/* Contact */}
      <section className="space-y-3">
        <div className="t-input-group">
          <label className="t-label" htmlFor="booking-name">
            Your name
          </label>
          <input
            id="booking-name"
            className="t-input"
            placeholder="e.g. Priya Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
        </div>
        <div className="t-input-group">
          <label className="t-label" htmlFor="booking-phone">
            Phone
          </label>
          <input
            id="booking-phone"
            className="t-input"
            placeholder="10-digit mobile"
            inputMode="numeric"
            pattern="[0-9]{10}"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            autoComplete="tel"
            required
          />
        </div>
      </section>

      {/* Pay toggle */}
      <button
        type="button"
        onClick={() => setPayNow((v) => !v)}
        className="t-package-card"
        data-selected={payNow ? "true" : "false"}
        aria-pressed={payNow}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold">Pay now before confirming</p>
            <p className="t-muted mt-0.5 text-xs leading-relaxed">
              {devMode
                ? "Demo mode — payment is simulated (no real charge)."
                : "Secure UPI / card checkout, then your slot is locked."}
            </p>
          </div>
          <span
            className="flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors"
            style={{
              backgroundColor: payNow ? "var(--t-primary)" : "var(--t-border)",
            }}
            aria-hidden
          >
            <span
              className="h-5 w-5 rounded-full bg-white shadow transition-transform"
              style={{ transform: payNow ? "translateX(1.25rem)" : "translateX(0)" }}
            />
          </span>
        </div>
      </button>

      {/* Summary + CTA */}
      <div className="t-card space-y-3 p-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="t-muted">Package</span>
          <span className="font-semibold">{selected?.name ?? "—"}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="t-muted">When</span>
          <span className="font-semibold">
            {slotDate || "—"} · {formatSlotLabel(slotTime)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-[var(--t-border)] pt-3 text-sm">
          <span className="t-muted">Total</span>
          <span className="text-lg font-bold" style={{ color: "var(--t-primary-text, var(--t-primary))" }}>
            ₹{selected?.price ?? 0}
          </span>
        </div>

        <button
          type="submit"
          disabled={isPending || !packageId}
          className="t-btn-primary"
        >
          {isPending
            ? "Booking…"
            : payNow
              ? `Pay ₹${selected?.price ?? 0} & book`
              : "Confirm free hold"}
        </button>
      </div>

      {message ? (
        <p
          className={
            messageTone === "error"
              ? "t-banner t-banner-error"
              : messageTone === "success"
                ? "t-banner t-banner-success"
                : "t-banner"
          }
          role="status"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
