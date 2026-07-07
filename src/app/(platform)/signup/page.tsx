import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/platform/auth-shell";
import { LoginForm } from "../login/login-form";
import { getSession } from "@/platform/auth/session";
import { isMsg91Configured } from "@/platform/sms/msg91";
import { getBusinessForTenant } from "@/platform/business/require-business";

export default async function SignupPage() {
  const session = await getSession();
  if (session) {
    const business = await getBusinessForTenant(session.userId);
    redirect(business ? "/dashboard" : "/onboarding");
  }

  const smsOtp = isMsg91Configured();
  const devOtp = process.env.DEV_OTP ?? "1111";

  return (
    <AuthShell
      mode="signup"
      title="Start your 14-day Pro trial"
      subtitle={smsOtp ? "phone_otp · SMS via MSG91" : `phone_otp · dev OTP ${devOtp}`}
      footer={
        <p className="text-sm text-brand-ink/55">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-purple">
            Sign in
          </Link>
        </p>
      }
    >
      <LoginForm redirectTo="/onboarding" />
    </AuthShell>
  );
}