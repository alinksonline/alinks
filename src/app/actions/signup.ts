"use server";

import { completeOnboardingAction } from "@/app/actions/business";
import {
  verifyEmailOtpAction,
  verifyOtpAction,
  verifyWidgetAccessTokenAction,
} from "@/app/actions/auth";
import type { AuthLoginMode } from "@/platform/auth/auth-mode";
import type { SiteTemplateId } from "@/core/types/page";
import { isValidEmail, normalizeEmail } from "@/core/utils/email";
import { isValidHandle, normalizeHandle } from "@/core/utils/slug";

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

  const email = normalizeEmail(input.email);
  if (!isValidEmail(email)) {
    return { success: false as const, error: "Enter a valid email address" };
  }

  const handle = normalizeHandle(input.handle || input.businessName);
  if (!isValidHandle(handle)) {
    return { success: false as const, error: "Choose a valid site handle (letters, numbers, hyphens)" };
  }

  const profile = { email, name: input.businessName.trim() };
  const auth =
    input.msg91AccessToken && input.phone
      ? await verifyWidgetAccessTokenAction(input.msg91AccessToken, input.phone, profile)
      : input.authMode === "email"
        ? await verifyEmailOtpAction(email, input.otp ?? "", profile)
        : await verifyOtpAction(input.phone ?? "", input.otp ?? "", profile);
  if (!auth.success) {
    return { success: false as const, error: auth.error ?? "OTP verification failed" };
  }

  const templateId = VERTICAL_TEMPLATE[input.vertical] ?? "general";

  const onboard = await completeOnboardingAction({
    businessName: input.businessName.trim(),
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

  return { success: true as const, handle: onboard.handle, role: auth.role };
}