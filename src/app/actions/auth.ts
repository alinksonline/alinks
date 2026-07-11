"use server";

import { redirect } from "next/navigation";
import {
  destroySession,
  resendEmailOtp,
  resendOtp,
  sendEmailOtp,
  sendOtp,
  verifyEmailOtp,
  verifyMsg91WidgetAndCreateSession,
  verifyOtp,
  type TenantSignupProfile,
} from "@/platform/auth/session";
import { getAuthLoginMode } from "@/platform/auth/auth-mode";
import { getOtpDeliveryMode } from "@/platform/sms/otp-mode";

export async function sendOtpAction(phone: string) {
  const result = await sendOtp(phone);
  if (!result.ok) {
    return { success: false as const, error: result.error ?? "Could not send OTP" };
  }
  return {
    success: true as const,
    mode: result.mode ?? getOtpDeliveryMode(),
  };
}

export async function sendEmailOtpAction(email: string) {
  const result = await sendEmailOtp(email);
  if (!result.ok) {
    return { success: false as const, error: result.error ?? "Could not send code" };
  }
  return {
    success: true as const,
    mode: result.mode ?? getAuthLoginMode(),
    // When mode is "dev", email may not have been delivered (Resend sandbox).
    devFallback: result.mode === "dev",
  };
}

export async function resendOtpAction(phone: string) {
  const result = await resendOtp(phone);
  if (!result.ok) {
    return { success: false as const, error: result.error ?? "Could not resend OTP" };
  }
  return {
    success: true as const,
    mode: result.mode ?? getOtpDeliveryMode(),
  };
}

export async function resendEmailOtpAction(email: string) {
  const result = await resendEmailOtp(email);
  if (!result.ok) {
    return { success: false as const, error: result.error ?? "Could not resend code" };
  }
  return { success: true as const, mode: result.mode ?? getAuthLoginMode() };
}

export async function verifyOtpAction(phone: string, otp: string, profile?: TenantSignupProfile) {
  const result = await verifyOtp(phone, otp, profile);
  if (!result.ok) {
    return { success: false as const, error: result.error ?? "Login failed" };
  }
  return { success: true as const, role: result.role, userId: result.userId };
}

export async function verifyEmailOtpAction(email: string, otp: string, profile?: TenantSignupProfile) {
  const result = await verifyEmailOtp(email, otp, profile);
  if (!result.ok) {
    return { success: false as const, error: result.error ?? "Verification failed" };
  }
  return { success: true as const, role: result.role, userId: result.userId };
}

export async function verifyWidgetAccessTokenAction(
  accessToken: string,
  phone: string,
  profile?: TenantSignupProfile,
) {
  const result = await verifyMsg91WidgetAndCreateSession(accessToken, phone, profile);
  if (!result.ok) {
    return { success: false as const, error: result.error ?? "Verification failed" };
  }
  return { success: true as const, role: result.role, userId: result.userId };
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}