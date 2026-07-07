"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { verifyOtpAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/core/utils/cn";

const inputClass =
  "w-full rounded-lg border border-tech-border bg-tech-bg px-3 py-2.5 font-mono text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-tech-cyan/50 focus:ring-2 focus:ring-tech-cyan/20";

export function LoginForm({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Enter a valid 10-digit phone number");
      return;
    }
    setStep("otp");
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

  const submitLabel = step === "phone" ? "Send OTP →" : isPending ? "Verifying…" : "Verify & continue →";

  return (
    <div>
      <div className="mb-6 flex gap-2">
        {(["phone", "otp"] as const).map((s) => (
          <span
            key={s}
            className={cn(
              "rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
              step === s
                ? "border-tech-cyan/40 bg-tech-cyan/10 text-tech-cyan"
                : "border-tech-border text-zinc-600",
            )}
          >
            {s === "phone" ? "1 · phone" : "2 · otp"}
          </span>
        ))}
      </div>

      {step === "phone" ? (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div>
            <label htmlFor="phone" className="tech-label mb-2 block">
              phone_number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className={inputClass}
              required
              autoComplete="tel"
            />
          </div>
          {error && <p className="font-mono text-xs text-red-400">{error}</p>}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full border border-tech-cyan/30 bg-tech-cyan/10 py-3 font-mono text-xs uppercase tracking-wider text-tech-cyan hover:bg-tech-cyan/20"
          >
            {submitLabel}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label htmlFor="otp" className="tech-label mb-2 block">
              otp_code
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="····"
              className={cn(inputClass, "text-center text-2xl tracking-[0.5em]")}
              required
              autoComplete="one-time-code"
            />
            <p className="mt-2 font-mono text-[10px] text-zinc-600">
              Sent to ••••{phone.replace(/\D/g, "").slice(-4) || "····"}
            </p>
          </div>
          {error && <p className="font-mono text-xs text-red-400">{error}</p>}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full border border-tech-cyan/30 bg-tech-cyan/10 py-3 font-mono text-xs uppercase tracking-wider text-tech-cyan hover:bg-tech-cyan/20"
          >
            {submitLabel}
          </Button>
          <button
            type="button"
            onClick={() => {
              setStep("phone");
              setOtp("");
              setError(null);
            }}
            className="w-full font-mono text-xs text-zinc-500 transition hover:text-tech-cyan"
          >
            ← change phone number
          </button>
        </form>
      )}
    </div>
  );
}