import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/platform/auth-shell";
import { LoginForm } from "./login-form";
import { getSession } from "@/platform/auth/session";
import { isMsg91Configured } from "@/platform/sms/msg91";
import { getBusinessForTenant } from "@/platform/business/require-business";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    if (session.role === "superadmin") redirect("/superadmin");
    const business = await getBusinessForTenant(session.userId);
    redirect(business ? "/dashboard" : "/onboarding");
  }

  const smsOtp = isMsg91Configured();

  return (
    <AuthShell
      mode="login"
      title="Sign in with phone OTP"
      subtitle={smsOtp ? "SMS OTP to your mobile number" : "Local dev — SMS not configured"}
      footer={
        <p className="text-sm text-brand-ink/55">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-brand-purple">
            Start trial
          </Link>
        </p>
      }
    >
      <LoginForm initialOtpMode={smsOtp ? "msg91" : "dev"} />
    </AuthShell>
  );
}