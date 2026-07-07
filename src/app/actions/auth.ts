"use server";

import { redirect } from "next/navigation";
import { destroySession, verifyOtp } from "@/platform/auth/session";

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