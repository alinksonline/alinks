"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createBookingAction,
  getAvailableSlotsAction,
  releaseBookingHoldAction,
} from "@/app/actions/salon";
import { openRazorpayCheckout, verifyPaymentViaApi } from "@/lib/razorpay-checkout";
import { formatSlotLabel } from "@/core/utils/appointment-slots";

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
  paymentMode?: string | null;
};

type StaffOption = {
  id: string;
  name: string;
  role: string;
};

type SlotChip = { time: string; label: string; available: boolean };

export function BookingForm({
  handle,
  packages,
  staff = [],
  onlinePayEnabled = false,
}: {
  handle: string;
  packages: PackageOption[];
  staff?: StaffOption[];
  /** Shop has connected their own Razorpay */
  onlinePayEnabled?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [packageId, setPackageId] = useState(packages[0]?.id ?? "");
  const [staffId, setStaffId] = useState<string>("");
  const [slotDate, setSlotDate] = useState(todayIsoDate());
  const [slotTime, setSlotTime] = useState("");
  const [slots, setSlots] = useState<SlotChip[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"error" | "success" | "info">("info");

  const selected = useMemo(
    () => packages.find((p) => p.id === packageId) ?? packages[0],
    [packageId, packages],
  );

  const paymentMode = selected?.paymentMode || "free";
  const requiresPayThenBook = paymentMode === "pay_then_book";
  const canPayOnline = onlinePayEnabled && requiresPayThenBook && (selected?.price ?? 0) > 0;
  /** Pay-then-book packages always charge online when gateway is ready. */
  const payNow = canPayOnline;

  useEffect(() => {
    if (!packageId || !slotDate) return;
    let cancelled = false;
    setSlotsLoading(true);
    void getAvailableSlotsAction({
      handle,
      packageId,
      slotDate,
      staffId: staffId || null,
    }).then((res) => {
      if (cancelled) return;
      setSlotsLoading(false);
      if (res.success) {
        setSlots(res.slots);
        const firstOpen = res.slots.find((s) => s.available);
        setSlotTime((prev) => {
          if (prev && res.slots.some((s) => s.time === prev && s.available)) return prev;
          return firstOpen?.time ?? "";
        });
      } else {
        setSlots([]);
        setSlotTime("");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [handle, packageId, slotDate, staffId]);

  function setStatus(text: string, tone: "error" | "success" | "info" = "info") {
    setMessage(text);
    setMessageTone(tone);
  }

  const ctaLabel = (() => {
    if (isPending) return "Booking…";
    if (requiresPayThenBook && !onlinePayEnabled) return "Online pay unavailable";
    if (payNow && canPayOnline) return `Pay ₹${selected?.price ?? 0} & lock slot`;
    if (paymentMode === "pay_at_salon") return "Confirm — pay at salon";
    return "Confirm free booking";
  })();

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!slotTime) {
          setStatus("Pick an available time slot.", "error");
          return;
        }
        if (requiresPayThenBook && !canPayOnline) {
          setStatus(
            "This package requires online payment. The salon has not connected Razorpay yet.",
            "error",
          );
          return;
        }
        startTransition(async () => {
          const result = await createBookingAction({
            handle,
            packageId,
            slotDate,
            slotTime,
            customerName: name,
            customerPhone: phone,
            staffId: staffId || null,
            payNow: payNow && canPayOnline,
          });

          if (!result.success) {
            setStatus(result.error, "error");
            return;
          }

          if (!payNow || !canPayOnline || !("razorpayOrderId" in result) || !result.razorpayOrderId) {
            const mode = "paymentMode" in result ? result.paymentMode : "free";
            const q = new URLSearchParams({
              booked: result.bookingId,
              mode: String(mode ?? "free"),
            });
            router.push(`/${handle}/book?${q.toString()}`);
            return;
          }

          if (!result.sessionId || !result.pendingBooking || !result.razorpayKeyId) {
            setStatus("Could not start payment. Salon may not have connected Razorpay.", "error");
            return;
          }

          const holdNote =
            "holdMinutes" in result && result.holdMinutes
              ? ` Slot held for ${result.holdMinutes} minutes while you pay.`
              : "";
          setStatus(`Opening payment…${holdNote}`, "info");

          try {
            await openRazorpayCheckout({
              keyId: result.razorpayKeyId,
              orderId: result.razorpayOrderId,
              amountPaise: result.amountPaise,
              name: result.businessName ?? "ALINKS Salon",
              description: selected?.name ?? "Salon booking",
              prefill: { name, contact: phone },
              onDismiss: () => {
                void releaseBookingHoldAction({ handle, bookingId: result.bookingId });
                setStatus("Payment cancelled — slot released. You can pick another time.", "info");
              },
              onFailure: (err) => {
                void releaseBookingHoldAction({ handle, bookingId: result.bookingId });
                setStatus(err, "error");
              },
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

                const q = new URLSearchParams({
                  booked: verified.bookingId ?? result.bookingId,
                  mode: "pay_then_book",
                  paid: "1",
                });
                router.push(`/${handle}/book?${q.toString()}`);
              },
            });
          } catch (err) {
            void releaseBookingHoldAction({ handle, bookingId: result.bookingId });
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
            const mode = p.paymentMode || "free";
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
                    <p className="t-muted mt-1 text-[10px] font-semibold uppercase tracking-wide">
                      {mode === "free"
                        ? "Free booking"
                        : mode === "pay_at_salon"
                          ? "Pay at salon"
                          : "Pay then book"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold" style={{ color: "var(--t-primary-text, var(--t-primary))" }}>
                      {mode === "free" && p.price === 0 ? "Free" : `₹${p.price}`}
                    </p>
                    <p className="t-muted text-[10px] font-medium">{p.durationMinutes} min</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Staff (optional) */}
      {staff.length > 0 ? (
        <section>
          <p className="t-label">Stylist (optional)</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="t-slot-chip"
              data-selected={!staffId ? "true" : "false"}
              onClick={() => setStaffId("")}
            >
              Anyone
            </button>
            {staff.map((s) => (
              <button
                key={s.id}
                type="button"
                className="t-slot-chip"
                data-selected={staffId === s.id ? "true" : "false"}
                onClick={() => setStaffId(s.id)}
              >
                {s.name}
              </button>
            ))}
          </div>
        </section>
      ) : null}

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
          {slotsLoading ? (
            <p className="t-muted mt-2 text-xs">Loading available times…</p>
          ) : slots.length === 0 ? (
            <p className="t-muted mt-2 text-xs">No slots this day — try another date.</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {slots.map((t) => (
                <button
                  key={t.time}
                  type="button"
                  className="t-slot-chip"
                  data-selected={slotTime === t.time ? "true" : "false"}
                  disabled={!t.available}
                  onClick={() => t.available && setSlotTime(t.time)}
                  aria-pressed={slotTime === t.time}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
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

      {/* Payment mode copy */}
      {requiresPayThenBook ? (
        <div className="t-card p-3 text-xs leading-relaxed">
          <p className="font-bold text-[var(--t-ink,#0f172a)]">Pay then book</p>
          <p className="t-muted mt-1">
            {canPayOnline
              ? "You pay online first (salon’s Razorpay). We hold the slot for 15 minutes while you complete payment. Money goes to the salon — not ALINKS."
              : "This package requires online payment, but the salon has not connected Razorpay yet. Choose another package or contact the salon."}
          </p>
        </div>
      ) : (
        <p className="t-muted text-[12px] leading-relaxed">
          {paymentMode === "pay_at_salon"
            ? "Pay at the salon when you arrive — no online payment required."
            : "This booking is free to confirm online."}
        </p>
      )}

      {/* Summary + CTA */}
      <div className="t-card space-y-3 p-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="t-muted">Package</span>
          <span className="font-semibold">{selected?.name ?? "—"}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="t-muted">When</span>
          <span className="font-semibold">
            {slotDate || "—"} · {slotTime ? formatSlotLabel(slotTime) : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-[var(--t-border)] pt-3 text-sm">
          <span className="t-muted">Total</span>
          <span className="text-lg font-bold" style={{ color: "var(--t-primary-text, var(--t-primary))" }}>
            {paymentMode === "free" && (selected?.price ?? 0) === 0 ? "Free" : `₹${selected?.price ?? 0}`}
          </span>
        </div>

        <button
          type="submit"
          disabled={isPending || !packageId || !slotTime || (requiresPayThenBook && !canPayOnline)}
          className="t-btn-primary"
        >
          {ctaLabel}
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
