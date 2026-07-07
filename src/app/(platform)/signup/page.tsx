import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/platform/auth-shell";
import { LoginForm } from "../login/login-form";
import { getSession } from "@/platform/auth/session";
import { getBusinessForTenant } from "@/platform/business/require-business";

export default async function SignupPage() {
  const session = await getSession();
  if (session) {
    const business = await getBusinessForTenant(session.userId);
    redirect(business ? "/dashboard" : "/onboarding");
  }

  const devOtp = process.env.DEV_OTP ?? "1111";

  return (
    <AuthShell
      mode="signup"
      title="Start your 14-day Pro trial"
      subtitle={`phone_otp · dev OTP ${devOtp}`}
      footer={
        <p className="font-mono text-xs text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="text-tech-cyan transition hover:text-white">
            Sign in →
          </Link>
        </p>
      }
    >
      <LoginForm redirectTo="/onboarding" />
    </AuthShell>
  );
}