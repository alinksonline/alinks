import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/platform/auth-shell";
import { SignupForm } from "@/components/platform/signup-form";
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

  return (
    <AuthShell
      mode="signup"
      title="Create your ALINKS business site"
      subtitle={
        smsOtp
          ? "Verify your mobile number · SMS OTP via MSG91"
          : "Local dev — configure MSG91 in .env for real SMS"
      }
      footer={
        <p className="text-sm text-brand-ink/55">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-purple">
            Sign in
          </Link>
        </p>
      }
    >
      <SignupForm otpMode={smsOtp ? "msg91" : "dev"} />
    </AuthShell>
  );
}