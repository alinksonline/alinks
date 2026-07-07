"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resendOtpAction, sendOtpAction, verifyOtpAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/core/utils/cn";

type LoginFormProps = {
  redirectTo?: string;
  initialOtpMode: "msg91" | "dev";
};

export function LoginForm({ redirectTo = "/dashboard", initialOtpMode }: LoginFormProps) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deliveryMode, setDeliveryMode] = useState<"msg91" | "dev">(initialOtpMode);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (phone.replace(/\D/g, "").length !== 10) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    startTransition(async () => {
      const result = await sendOtpAction(phone);
      if (!result.success) {
        setError(result.error ?? "Could not send OTP");
        return;
      }
      setDeliveryMode(result.mode);
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

  const last4 = phone.replace(/\D/g, "").slice(-4);

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
            {s === "phone" ? "1 · Mobile" : "2 · OTP"}
          </span>
        ))}
      </div>

      {step === "phone" ? (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div>
            <label htmlFor="phone" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
              Mobile / WhatsApp number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="98765 43210"
              className="premium-input"
              required
              autoComplete="tel"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <Button type="submit" variant="bronze" disabled={isPending}>
            {isPending ? "Sending…" : "Send OTP"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-5">
          <div className="rounded-xl border border-brand-turquoise/25 bg-brand-turquoise/5 px-4 py-3 text-sm">
            {deliveryMode === "msg91" ? (
              <>
                <p className="font-semibold text-brand-ink">OTP sent to +91 ••••{last4}</p>
                <p className="mt-1 text-xs text-brand-ink/55">Enter the code from your SMS — not a demo OTP.</p>
              </>
            ) : (
              <p className="text-xs text-brand-ink/55">
                Dev mode: use <code className="rounded bg-brand-mist px-1">DEV_OTP</code> from your local{" "}
                <code className="rounded bg-brand-mist px-1">.env</code>
              </p>
            )}
          </div>
          <div>
            <label htmlFor="otp" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
              OTP code
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="····"
              className="premium-input text-center text-2xl tracking-[0.4em]"
              required
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <Button type="submit" variant="bronze" disabled={isPending}>
            {isPending ? "Verifying…" : "Continue"}
          </Button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => startTransition(async () => {
                const r = await resendOtpAction(phone);
                if (!r.success) setError(r.error ?? "Resend failed");
              })}
              disabled={isPending}
              className="flex-1 text-xs font-semibold text-brand-purple"
            >
              Resend OTP
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setError(null);
              }}
              className="flex-1 text-xs font-medium text-brand-ink/50"
            >
              ← Change number
            </button>
          </div>
        </form>
      )}
    </div>
  );
}