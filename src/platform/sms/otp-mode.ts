import { getEnv } from "@/core/config/env";

export type OtpDeliveryMode = "msg91-widget" | "msg91-api" | "dev";

export function isMsg91WidgetConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_MSG91_WIDGET_ID?.trim() && process.env.NEXT_PUBLIC_MSG91_WIDGET_TOKEN?.trim());
}

export function isMsg91ApiConfigured(): boolean {
  const env = getEnv();
  return Boolean(
    env.MSG91_AUTH_KEY &&
      env.MSG91_OTP_TEMPLATE_ID &&
      env.MSG91_OTP_TEMPLATE_ID !== env.MSG91_AUTH_KEY,
  );
}

/** Force widget on localhost (e.g. via ngrok). hCaptcha blocks bare localhost by default. */
export function isMsg91WidgetForcedInDev(): boolean {
  return process.env.NEXT_PUBLIC_MSG91_WIDGET_FORCE === "true";
}

/**
 * Widget in production only. Local dev always uses msg91-api (hCaptcha blocks localhost).
 * Set NEXT_PUBLIC_MSG91_WIDGET_FORCE=true only when testing widget on a public URL.
 */
export function getOtpDeliveryMode(): OtpDeliveryMode {
  const env = getEnv();
  const widgetReady = isMsg91WidgetConfigured();
  const apiReady = isMsg91ApiConfigured();
  const isDev = env.NODE_ENV !== "production";

  if (isDev) {
    if (widgetReady && isMsg91WidgetForcedInDev()) return "msg91-widget";
    if (apiReady) return "msg91-api";
    return "dev";
  }

  if (widgetReady) return "msg91-widget";
  if (apiReady) return "msg91-api";
  return "dev";
}

export function getMsg91WidgetPublicConfig(): { widgetId: string; widgetToken: string } | null {
  if (getOtpDeliveryMode() !== "msg91-widget") return null;
  const widgetId = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID?.trim();
  const widgetToken = process.env.NEXT_PUBLIC_MSG91_WIDGET_TOKEN?.trim();
  if (!widgetId || !widgetToken) return null;
  return { widgetId, widgetToken };
}