import { redirect } from "next/navigation";
import { requireAuth } from "@/platform/auth/session";
import { getBusinessForTenant } from "@/platform/business/require-business";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const session = await requireAuth();
  const business = await getBusinessForTenant(session.userId);
  if (business) redirect("/dashboard");

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Set up your business</h1>
      <p className="mt-2 text-sm text-slate-600">14-day Pro trial · 5-page mini-site · Phase 1</p>
      <div className="mt-8">
        <OnboardingForm />
      </div>
    </main>
  );
}