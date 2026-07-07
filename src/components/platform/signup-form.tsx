"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeSignupAction } from "@/app/actions/signup";
import { resendOtpAction, sendOtpAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import type { SiteTemplateId } from "@/core/types/page";
import { normalizeHandle } from "@/core/utils/slug";
import { cn } from "@/core/utils/cn";

const VERTICALS: { id: string; label: string; note?: string }[] = [
  { id: "salon", label: "Salon & beauty" },
  { id: "kirana", label: "Kirana / grocery shop" },
  { id: "ecommerce", label: "Retail / ecommerce" },
  { id: "clinic", label: "Clinic / doctor (license required to publish)" },
  { id: "pharmacy", label: "Pharmacy (Phase 2 — license required)" },
  { id: "restaurant", label: "Restaurant / food" },
  { id: "general", label: "Other local business" },
];

type SignupFormProps = {
  otpMode: "msg91" | "dev";
};

export function SignupForm({ otpMode }: SignupFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<"business" | "otp">("business");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [handle, setHandle] = useState("");
  const [vertical, setVertical] = useState("salon");
  const [businessPurpose, setBusinessPurpose] = useState("");
  const [otp, setOtp] = useState("");
  const [acceptTos, setAcceptTos] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptAup, setAcceptAup] = useState(false);
  const [acceptResponsibility, setAcceptResponsibility] = useState(false);
  const [acceptNoHarmfulUse, setAcceptNoHarmfulUse] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveryMode, setDeliveryMode] = useState<"msg91" | "dev">(otpMode);
  const [isPending, startTransition] = useTransition();

  const suggestedHandle = useMemo(
    () => normalizeHandle(handle || businessName),
    [handle, businessName],
  );

  const legalOk =
    acceptTos && acceptPrivacy && acceptAup && acceptResponsibility && acceptNoHarmfulUse;

  const sendOtp = () => {
    setError(null);
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError("Enter your 10-digit Indian mobile / WhatsApp number");
      return;
    }
    if (!businessName.trim()) {
      setError("Enter your business name");
      return;
    }
    if (!legalOk) {
      setError("Accept all declarations to continue");
      return;
    }
    if (businessPurpose.trim().length < 10) {
      setError("Describe what your business does (helps us prevent misuse)");
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

  const resendOtp = () => {
    setError(null);
    startTransition(async () => {
      const result = await resendOtpAction(phone);
      if (!result.success) {
        setError(result.error ?? "Could not resend OTP");
        return;
      }
    });
  };

  const completeSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await completeSignupAction({
        phone,
        otp,
        businessName: businessName.trim(),
        handle: suggestedHandle,
        vertical,
        businessPurpose: businessPurpose.trim(),
        templateId: (vertical === "salon" ? "salon" : vertical === "kirana" || vertical === "ecommerce" ? "ecommerce" : "general") as SiteTemplateId,
        acceptTos,
        acceptPrivacy,
        acceptAup,
        acceptResponsibility,
        acceptNoHarmfulUse,
      });
      if (!result.success) {
        setError(result.error ?? "Signup failed");
        return;
      }
      router.push(result.role === "superadmin" ? "/superadmin" : "/editor");
      router.refresh();
    });
  };

  const last4 = phone.replace(/\D/g, "").slice(-4);

  return (
    <div>
      <div className="mb-6 flex gap-2">
        {(["business", "otp"] as const).map((s) => (
          <span
            key={s}
            className={cn(
              "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider",
              step === s ? "bg-brand-purple/12 text-brand-purple" : "bg-brand-mist text-brand-ink/40",
            )}
          >
            {s === "business" ? "1 · Your business" : "2 · Verify mobile"}
          </span>
        ))}
      </div>

      {step === "business" ? (
        <div className="space-y-5">
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
              autoComplete="tel"
              inputMode="numeric"
            />
            <p className="mt-1.5 text-xs text-brand-ink/45">
              OTP is sent by SMS to this number. Use the same number you use for WhatsApp business.
            </p>
          </div>

          <div>
            <label htmlFor="businessName" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
              Business name
            </label>
            <input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Priya Beauty Salon"
              className="premium-input"
              required
            />
          </div>

          <div>
            <label htmlFor="handle" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
              Site address
            </label>
            <div className="flex items-center gap-1 rounded-xl border border-brand-ink/10 bg-brand-surface px-3 py-2">
              <span className="shrink-0 text-sm text-brand-ink/40">alinks.online/</span>
              <input
                id="handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder={suggestedHandle || "your-shop"}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="vertical" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
              Business type
            </label>
            <select
              id="vertical"
              value={vertical}
              onChange={(e) => setVertical(e.target.value)}
              className="premium-input"
            >
              {VERTICALS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="purpose" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
              What will you use ALINKS for?
            </label>
            <textarea
              id="purpose"
              value={businessPurpose}
              onChange={(e) => setBusinessPurpose(e.target.value)}
              rows={3}
              placeholder="e.g. Salon bookings, package sales, and sharing offers on WhatsApp"
              className="premium-input resize-none"
            />
            <p className="mt-1.5 text-xs text-brand-ink/45">
              Required for compliance. Illegal, fraudulent, or harmful use is prohibited.
            </p>
          </div>

          <div className="space-y-3 rounded-xl border border-brand-ink/8 bg-brand-mist/40 p-4 text-sm text-brand-ink/80">
            <label className="flex gap-2">
              <input type="checkbox" checked={acceptTos} onChange={(e) => setAcceptTos(e.target.checked)} className="mt-0.5" />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="font-semibold text-brand-purple">
                  Terms of Service
                </Link>
              </span>
            </label>
            <label className="flex gap-2">
              <input type="checkbox" checked={acceptPrivacy} onChange={(e) => setAcceptPrivacy(e.target.checked)} className="mt-0.5" />
              <span>
                I agree to the{" "}
                <Link href="/privacy" className="font-semibold text-brand-purple">
                  Privacy Policy
                </Link>
              </span>
            </label>
            <label className="flex gap-2">
              <input type="checkbox" checked={acceptAup} onChange={(e) => setAcceptAup(e.target.checked)} className="mt-0.5" />
              <span>
                I agree to the{" "}
                <Link href="/aup" className="font-semibold text-brand-purple">
                  Acceptable Use Policy
                </Link>
              </span>
            </label>
            <label className="flex gap-2">
              <input type="checkbox" checked={acceptResponsibility} onChange={(e) => setAcceptResponsibility(e.target.checked)} className="mt-0.5" />
              <span>I am solely responsible for my business, licences, products, and services — not Artix</span>
            </label>
            <label className="flex gap-2">
              <input type="checkbox" checked={acceptNoHarmfulUse} onChange={(e) => setAcceptNoHarmfulUse(e.target.checked)} className="mt-0.5" />
              <span>I will not use ALINKS for illegal, fraudulent, hateful, or harmful activities</span>
            </label>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <Button type="button" variant="bronze" disabled={isPending} onClick={sendOtp}>
            {isPending ? "Sending OTP…" : "Send OTP to verify number"}
          </Button>
        </div>
      ) : (
        <form onSubmit={completeSignup} className="space-y-5">
          <div className="rounded-xl border border-brand-turquoise/25 bg-brand-turquoise/5 px-4 py-3 text-sm text-brand-ink/80">
            {deliveryMode === "msg91" ? (
              <>
                <p className="font-semibold text-brand-ink">Check SMS on +91 ••••{last4}</p>
                <p className="mt-1 text-xs text-brand-ink/55">
                  OTP sent via MSG91. If it does not arrive in 60 seconds, tap Resend. Do not use a demo code — enter the SMS OTP only.
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-brand-ink">Local dev mode — SMS not configured</p>
                <p className="mt-1 text-xs text-brand-ink/55">
                  Use the OTP from <code className="rounded bg-brand-mist px-1">DEV_OTP</code> in your{" "}
                  <code className="rounded bg-brand-mist px-1">.env</code> file (not shown here for security).
                </p>
              </>
            )}
          </div>

          <div>
            <label htmlFor="otp" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
              OTP from SMS
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
            {isPending ? "Creating your site…" : "Verify & create my ALINKS site"}
          </Button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={resendOtp}
              disabled={isPending}
              className="flex-1 text-xs font-semibold text-brand-purple"
            >
              Resend OTP
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("business");
                setOtp("");
                setError(null);
              }}
              className="flex-1 text-xs font-medium text-brand-ink/50"
            >
              ← Edit details
            </button>
          </div>
        </form>
      )}
    </div>
  );
}