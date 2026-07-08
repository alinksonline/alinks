/**
 * MSG91 OTP Widget — client SDK (Web SDK · custom UI).
 *
 * Faithful TypeScript port of the MSG91 dashboard HTML snippet:
 *   - configuration object (widgetId, tokenAuth, exposeMethods, callbacks)
 *   - loadOtpScript with verify.msg91.com → verify.phone91.com fallback
 *   - initSendOTP(configuration) on script onload
 *   - window.sendOtp / retryOtp / verifyOtp when exposeMethods is true
 *
 * Note: MSG91 widgets with captcha enabled use hCaptcha, which rejects bare localhost.
 * Use msg91-api on localhost, disable captcha in the MSG91 dashboard, or test via ngrok.
 */

import { toMsg91WidgetIdentifier } from "@/core/utils/phone";

const SCRIPT_URLS = [
  "https://verify.msg91.com/otp-provider.js",
  "https://verify.phone91.com/otp-provider.js",
] as const;

const SCRIPT_ID = "msg91-otp-provider";
const CAPTCHA_ID = "msg91-captcha-root";
const METHOD_POLL_MS = 100;
const METHOD_POLL_MAX = 50;

export type Msg91WidgetSuccess = {
  message?: string;
  type?: string;
  "access-token"?: string;
  accessToken?: string;
  token?: string;
  [key: string]: unknown;
};

export type Msg91WidgetConfiguration = {
  widgetId: string;
  tokenAuth: string;
  identifier?: string;
  exposeMethods: boolean;
  captchaRenderId?: string;
  success?: (data: Msg91WidgetSuccess) => void;
  failure?: (error: unknown) => void;
};

declare global {
  interface Window {
    initSendOTP?: (configuration: Msg91WidgetConfiguration) => void;
    sendOtp?: (
      identifier: string,
      success?: (data: Msg91WidgetSuccess) => void,
      failure?: (error: unknown) => void,
    ) => void;
    retryOtp?: (
      channel: string | null,
      success?: (data: Msg91WidgetSuccess) => void,
      failure?: (error: unknown) => void,
    ) => void;
    verifyOtp?: (
      otp: string | number,
      success?: (data: Msg91WidgetSuccess) => void,
      failure?: (error: unknown) => void,
    ) => void;
    isCaptchaVerified?: () => boolean;
  }
}

let initPromise: Promise<void> | null = null;

export function isMsg91WidgetLocalhost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

export function isMsg91WidgetForceEnabled(): boolean {
  return process.env.NEXT_PUBLIC_MSG91_WIDGET_FORCE === "true";
}

/** Widget + hCaptcha only on real hosts (or localhost when explicitly forced). */
export function isMsg91WidgetClientAllowed(): boolean {
  if (typeof window === "undefined") return false;
  if (isMsg91WidgetLocalhost() && !isMsg91WidgetForceEnabled()) return false;
  return true;
}

/** Remove stale MSG91/hCaptcha artifacts (e.g. after switching to msg91-api on localhost). */
export function teardownMsg91Widget(): void {
  if (typeof document === "undefined") return;

  initPromise = null;

  for (const id of [SCRIPT_ID, `${SCRIPT_ID}-fallback`]) {
    document.getElementById(id)?.remove();
  }
  document.getElementById(CAPTCHA_ID)?.remove();

  document
    .querySelectorAll('script[src*="otp-provider.js"], iframe[src*="hcaptcha"], div[id^="hcaptcha"]')
    .forEach((node) => node.remove());

  if (typeof window !== "undefined") {
    delete window.initSendOTP;
    delete window.sendOtp;
    delete window.retryOtp;
    delete window.verifyOtp;
    delete window.isCaptchaVerified;
  }
}

function ensureCaptchaMount(): void {
  if (typeof document === "undefined" || document.getElementById(CAPTCHA_ID)) return;
  const el = document.createElement("div");
  el.id = CAPTCHA_ID;
  if (isMsg91WidgetLocalhost()) {
    el.style.cssText = "margin-top:0.75rem;min-height:78px;";
  } else {
    el.setAttribute("aria-hidden", "true");
    el.style.cssText = "position:fixed;left:-9999px;width:1px;height:1px;overflow:hidden;";
  }
  document.body.appendChild(el);
}

/** Builds the `configuration` object from the MSG91 dashboard snippet. */
export function createMsg91WidgetConfiguration(
  widgetId: string,
  widgetToken: string,
): Msg91WidgetConfiguration {
  ensureCaptchaMount();
  return {
    widgetId,
    tokenAuth: widgetToken,
    exposeMethods: true,
    captchaRenderId: CAPTCHA_ID,
    success: () => {},
    failure: () => {},
  };
}

export function isMsg91WidgetMethodsReady(): boolean {
  return Boolean(
    typeof window !== "undefined" &&
      window.sendOtp &&
      window.retryOtp &&
      window.verifyOtp,
  );
}

function waitForWidgetMethods(): Promise<void> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const tick = () => {
      if (isMsg91WidgetMethodsReady()) {
        resolve();
        return;
      }
      attempts += 1;
      if (attempts >= METHOD_POLL_MAX) {
        reject(new Error("MSG91 widget methods not available"));
        return;
      }
      setTimeout(tick, METHOD_POLL_MS);
    };
    tick();
  });
}

/**
 * Port of MSG91's `loadOtpScript` IIFE — loads script with CDN fallback,
 * then calls `initSendOTP(configuration)` inside onload.
 */
function loadOtpScript(configuration: Msg91WidgetConfiguration): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  const existing = document.getElementById(SCRIPT_ID);
  if (existing?.dataset.loaded === "true" && typeof window.initSendOTP === "function") {
    window.initSendOTP(configuration);
    return waitForWidgetMethods();
  }

  return new Promise((resolve, reject) => {
    let urlIndex = 0;

    const attempt = () => {
      if (urlIndex >= SCRIPT_URLS.length) {
        reject(new Error("Could not load MSG91 OTP widget"));
        return;
      }

      const script = document.createElement("script");
      script.id = urlIndex === 0 ? SCRIPT_ID : `${SCRIPT_ID}-fallback`;
      script.src = SCRIPT_URLS[urlIndex];
      script.type = "text/javascript";
      script.async = true;

      script.onload = () => {
        if (typeof window.initSendOTP === "function") {
          script.dataset.loaded = "true";
          window.initSendOTP(configuration);
          waitForWidgetMethods().then(resolve).catch(reject);
          return;
        }
        urlIndex += 1;
        attempt();
      };

      script.onerror = () => {
        urlIndex += 1;
        attempt();
      };

      document.head.appendChild(script);
    };

    attempt();
  });
}

export function initializeMsg91Widget(widgetId: string, widgetToken: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!isMsg91WidgetClientAllowed()) {
    return Promise.reject(
      new Error(
        msg91WidgetLocalhostHint() ??
          "MSG91 OTP widget is not available in this environment.",
      ),
    );
  }
  if (isMsg91WidgetMethodsReady()) return Promise.resolve();
  if (initPromise) return initPromise;

  const configuration = createMsg91WidgetConfiguration(widgetId, widgetToken);
  initPromise = loadOtpScript(configuration).catch((error) => {
    initPromise = null;
    throw error;
  });

  return initPromise;
}

export function msg91WidgetLocalhostHint(): string | null {
  if (!isMsg91WidgetLocalhost()) return null;
  return "MSG91 captcha cannot run on localhost. Local dev uses the direct MSG91 API instead. For widget testing, disable captcha in the MSG91 dashboard or use a public URL (e.g. ngrok) with NEXT_PUBLIC_MSG91_WIDGET_FORCE=true.";
}

function widgetFailureMessage(error: unknown): string {
  const raw =
    typeof error === "string"
      ? error
      : error && typeof error === "object" && "message" in error
        ? String((error as { message?: string }).message)
        : "";

  const lower = raw.toLowerCase();
  if (
    lower.includes("network-error") ||
    lower.includes("localhost") ||
    lower.includes("hcaptcha") ||
    lower.includes("captcha")
  ) {
    return (
      msg91WidgetLocalhostHint() ??
      "MSG91 captcha verification failed. Disable captcha in your MSG91 OTP widget settings, or complete the captcha challenge before sending OTP."
    );
  }

  return raw || "MSG91 widget request failed";
}

function extractAccessToken(data: Msg91WidgetSuccess): string | null {
  const token = data["access-token"] ?? data.accessToken ?? data.token;
  return token?.trim() || null;
}

/** `window.sendOtp('919999999999', success, failure)` */
export function msg91WidgetSendOtp(phone10: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.sendOtp) {
      reject(new Error("MSG91 sendOtp is not available"));
      return;
    }
    if (typeof window.isCaptchaVerified === "function" && !window.isCaptchaVerified()) {
      reject(
        new Error(
          "Complete the security check (captcha) above before sending OTP. On localhost, use msg91-api mode instead.",
        ),
      );
      return;
    }
    window.sendOtp(
      toMsg91WidgetIdentifier(phone10),
      () => resolve(),
      (error) => reject(new Error(widgetFailureMessage(error))),
    );
  });
}

/** `window.retryOtp(null, success, failure)` — null channel for default widget config */
export function msg91WidgetRetryOtp(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.retryOtp) {
      reject(new Error("MSG91 retryOtp is not available"));
      return;
    }
    window.retryOtp(
      null,
      () => resolve(),
      (error) => reject(new Error(widgetFailureMessage(error))),
    );
  });
}

/** `window.verifyOtp(otp, success, failure)` → JWT access-token for server verify */
export function msg91WidgetVerifyOtp(otp: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.verifyOtp) {
      reject(new Error("MSG91 verifyOtp is not available"));
      return;
    }
    window.verifyOtp(
      otp.replace(/\D/g, ""),
      (data) => {
        const token = extractAccessToken(data);
        if (!token) {
          reject(new Error("MSG91 did not return an access token"));
          return;
        }
        resolve(token);
      },
      (error) => reject(new Error(widgetFailureMessage(error))),
    );
  });
}