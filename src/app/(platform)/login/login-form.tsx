"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendOtpAction, verifyOtpAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/core/utils/cn";

export function LoginForm({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [devMode, setDevMode] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Enter a valid 10-digit phone number");
      return;
    }
    startTransition(async () => {
      const result = await sendOtpAction(phone);
      if (!result.success) {
        setError(result.error ?? "Could not send OTP");
        return;
      }
      setDevMode(result.devMode);
      setStep("otp");
    });
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await verifyOtpAction(phone, otp);
      if (!result.success) {
        setError(result.error ?? "Login failed");
        return;
      }
      router.push(result.role === "superadmin" ? "/superadmin" : redirectTo);
      router.refresh();
    });
  };

  const submitLabel =
    step === "phone"
      ? isPending
        ? "Sending…"
        : "Send OTP"
      : isPending
        ? "Verifying…"
        : "Continue";

  return (
    <div>
      <div className="mb-6 flex gap-2">
        {(["phone", "otp"] as const).map((s) => (
          <span
            key={s}
            className={cn(
              "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider",
              step === s ? "bg-brand-purple/12 text-brand-purple" : "bg-brand-mist text-brand-ink/40",
            )}
          >
            {s === "phone" ? "1 · Phone" : "2 · OTP"}
          </span>
        ))}
      </div>

      {step === "phone" ? (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div>
            <label htmlFor="phone" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
              Phone number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="premium-input"
              required
              autoComplete="tel"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <Button type="submit" variant="bronze" disabled={isPending}>
            {submitLabel}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label htmlFor="otp" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
              OTP code
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="····"
              className="premium-input text-center text-2xl tracking-[0.5em]"
              required
              autoComplete="one-time-code"
            />
            <p className="mt-2 text-xs text-brand-ink/45">
              {devMode ? "Dev mode — use DEV_OTP from .env" : `SMS sent to ••••${phone.replace(/\D/g, "").slice(-4) || "····"}`}
            </p>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <Button type="submit" variant="bronze" disabled={isPending}>
            {submitLabel}
          </Button>
          <button
            type="button"
            onClick={() => {
              setStep("phone");
              setOtp("");
              setError(null);
            }}
            className="w-full text-xs font-medium text-brand-ink/50"
          >
            ← Change phone number
          </button>
        </form>
      )}
    </div>
  );
}