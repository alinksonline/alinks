"use client";

import { useEffect } from "react";
import type { OtpDeliveryMode } from "@/platform/sms/otp-mode";

/** Strips leftover MSG91 scripts/hCaptcha when auth pages run in msg91-api or dev mode. */
export function Msg91WidgetCleanup({ otpMode }: { otpMode: OtpDeliveryMode }) {
  useEffect(() => {
    if (otpMode === "msg91-widget") return;
    void import("@/platform/sms/msg91-widget-client").then((mod) => mod.teardownMsg91Widget());
  }, [otpMode]);

  return null;
}