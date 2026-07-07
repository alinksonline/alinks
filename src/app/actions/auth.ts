"use server";

import { redirect } from "next/navigation";
import { destroySession, sendOtp, verifyOtp } from "@/platform/auth/session";
import { resendLoginOtp } from "@/platform/sms/msg91";
import { isMsg91Configured } from "@/platform/sms/msg91";

export async function sendOtpAction(phone: string) {
  const result = await sendOtp(phone);
  if (!result.ok) {
    return { success: false as const, error: result.error ?? "Could not send OTP" };
  }
  return {
    success: true as const,
    mode: result.mode ?? (isMsg91Configured() ? "msg91" : "dev"),
  };
}

export async function resendOtpAction(phone: string) {
  const result = await sendOtp(phone);
  if (!result.ok) {
    return { success: false as const, error: result.error ?? "Could not resend OTP" };
  }
  if (result.mode === "msg91") {
    const retry = await resendLoginOtp(phone);
    if (!retry.ok) {
      return { success: false as const, error: retry.error ?? "Could not resend OTP" };
    }
  }
  return { success: true as const, mode: result.mode ?? "msg91" };
}

export async function verifyOtpAction(phone: string, otp: string) {
  const result = await verifyOtp(phone, otp);
  if (!result.ok) {
    return { success: false as const, error: result.error ?? "Login failed" };
  }
  return { success: true as const, role: result.role };
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}