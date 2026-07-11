import { getEnv } from "@/core/config/env";

type ResendResponse = { id?: string; message?: string; name?: string };

export async function sendResendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<{ ok: boolean; error?: string }> {
  const env = getEnv();
  if (!env.RESEND_API_KEY) {
    return { ok: false, error: "Email service is not configured" };
  }

  const from = env.RESEND_FROM_EMAIL?.trim() || "ALINKS <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  const data = (await res.json().catch(() => ({}))) as ResendResponse;
  if (!res.ok) {
    const raw = data.message ?? `Resend error (${res.status})`;
    const lower = raw.toLowerCase();
    // Free-tier / sandbox Resend only delivers to the account owner until a domain is verified.
    if (
      lower.includes("only send testing emails") ||
      lower.includes("verify a domain") ||
      lower.includes("not authorized to send")
    ) {
      return {
        ok: false,
        error:
          process.env.NODE_ENV === "production"
            ? "Email delivery is limited — verify your sending domain in Resend, or contact support."
            : `${raw} On localhost you can still complete login/signup with DEV_OTP from .env after tapping “Email me a code”.`,
      };
    }
    return { ok: false, error: raw };
  }

  return { ok: true };
}

export async function sendLoginOtpEmail(to: string, code: string): Promise<{ ok: boolean; error?: string }> {
  return sendResendEmail(
    to,
    `${code} is your ALINKS sign-in code`,
    `
      <div style="font-family:system-ui,sans-serif;max-width:420px;margin:0 auto;padding:24px">
        <p style="color:#5b21b6;font-weight:700;font-size:18px;margin:0 0 16px">ALINKS</p>
        <p style="margin:0 0 8px;color:#111">Your sign-in code:</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:6px;margin:16px 0;color:#111">${code}</p>
        <p style="margin:0;color:#666;font-size:14px">Valid for 10 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `,
  );
}