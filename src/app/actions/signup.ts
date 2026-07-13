"use server";

import { completeOnboardingForTenant } from "@/app/actions/business";
import type { SiteTemplateId } from "@/core/types/page";
import { isValidEmail, normalizeEmail } from "@/core/utils/email";
import { tenDigitMobileError } from "@/core/utils/phone";
import { isValidHandle, normalizeHandle } from "@/core/utils/slug";
import type { AuthLoginMode } from "@/platform/auth/auth-mode";
import {
  verifyEmailOtp,
  verifyMsg91WidgetAndCreateSession,
  verifyOtp,
} from "@/platform/auth/session";

export type SignupPayload = {
  authMode: AuthLoginMode;
  phone?: string;
  email: string;
  otp?: string;
  msg91AccessToken?: string;
  businessName: string;
  handle: string;
  vertical: string;
  businessPurpose: string;
  templateId: SiteTemplateId;
  acceptTos: boolean;
  acceptPrivacy: boolean;
  acceptAup: boolean;
  acceptResponsibility: boolean;
  acceptNoHarmfulUse: boolean;
};

const VERTICAL_TEMPLATE: Record<string, SiteTemplateId> = {
  general: "general",
  salon: "salon",
  ecommerce: "ecommerce",
  grocery: "ecommerce",
  kirana: "ecommerce",
  clinic: "general",
  pharmacy: "general",
  restaurant: "general",
};

export async function completeSignupAction(input: SignupPayload) {
  if (!input.acceptTos || !input.acceptPrivacy || !input.acceptAup) {
    return { success: false as const, error: "You must accept Terms, Privacy, and Acceptable Use Policy" };
  }
  if (!input.acceptResponsibility || !input.acceptNoHarmfulUse) {
    return {
      success: false as const,
      error: "You must confirm lawful use and your responsibility for your business",
    };
  }

  const purpose = input.businessPurpose.trim();
  if (purpose.length < 10) {
    return { success: false as const, error: "Describe what your business does (at least 10 characters)" };
  }

  const businessName = input.businessName.trim();
  if (!businessName) {
    return { success: false as const, error: "Enter your business name" };
  }

  const email = normalizeEmail(input.email);
  if (!isValidEmail(email)) {
    return { success: false as const, error: "Enter a valid email address" };
  }

  const handle = normalizeHandle(input.handle || businessName);
  if (!isValidHandle(handle)) {
    return { success: false as const, error: "Choose a valid site handle (letters, numbers, hyphens)" };
  }

  const usesEmail = input.authMode === "email";
  if (!usesEmail) {
    const phoneError = tenDigitMobileError(input.phone ?? "");
    if (phoneError) {
      return { success: false as const, error: phoneError };
    }
  }

  const profile = { email, name: businessName };

  // Verify identity + create session cookie for the *next* request.
  // Do not call getSession() in this same action — Next.js does not expose
  // cookies().set values via cookies().get until the following request.
  const auth = input.msg91AccessToken && input.phone
    ? await verifyMsg91WidgetAndCreateSession(input.msg91AccessToken, input.phone, profile)
    : usesEmail
      ? await verifyEmailOtp(email, input.otp ?? "", profile)
      : await verifyOtp(input.phone ?? "", input.otp ?? "", profile);

  if (!auth.ok || !auth.userId) {
    return { success: false as const, error: auth.error ?? "OTP verification failed" };
  }

  // Tenant ≠ superadmin: operators cannot register a client business on the same account.
  if (auth.role === "superadmin") {
    return {
      success: false as const,
      error: "Superadmin cannot sign up as a tenant. Use a different email for a business site.",
    };
  }

  const templateId = VERTICAL_TEMPLATE[input.vertical] ?? input.templateId ?? "general";

  const onboard = await completeOnboardingForTenant(auth.userId, {
    businessName,
    handle,
    vertical: input.vertical,
    templateId,
    businessPurpose: purpose,
    acceptTos: input.acceptTos,
    acceptPrivacy: input.acceptPrivacy,
    acceptAup: input.acceptAup,
  });

  if (!onboard.success) {
    return { success: false as const, error: onboard.error ?? "Could not create your business" };
  }

  // Always tenant after successful client signup (superadmin blocked above).
  return { success: true as const, handle: onboard.handle, role: "tenant" as const };
}
