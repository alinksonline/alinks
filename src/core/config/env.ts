import { z } from "zod";

function vercelAppOrigin(): string | undefined {
  const host = process.env.VERCEL_URL?.trim();
  return host ? `https://${host}` : undefined;
}

function resolvePublicUrl(explicit: string | undefined, fallbackHost: string): string {
  const trimmed = explicit?.trim();
  if (trimmed) {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    return `https://${trimmed}`;
  }
  return vercelAppOrigin() ?? `http://${fallbackHost}`;
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url().optional(),
  SUPERADMIN_PHONE: z.string().default("9999999999"),
  DEV_OTP: z.string().default("1111"),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_ROOT_DOMAIN: z.string(),
  NEXT_PUBLIC_PLATFORM_HOST: z.string(),
  NEXT_PUBLIC_MARKETING_HOST: z.string(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  GOOGLE_SERVICE_ACCOUNT_JSON: z.string().optional(),
  STORAGE_DEV_MODE: z.enum(["true", "false"]).optional(),
  OPENROUTER_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function getEnv(): Env {
  const rootDomain =
    process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    "localhost:3000";

  return envSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    SUPERADMIN_PHONE: process.env.SUPERADMIN_PHONE,
    DEV_OTP: process.env.DEV_OTP,
    NEXT_PUBLIC_APP_URL: resolvePublicUrl(process.env.NEXT_PUBLIC_APP_URL, rootDomain),
    NEXT_PUBLIC_ROOT_DOMAIN: rootDomain,
    NEXT_PUBLIC_PLATFORM_HOST: process.env.NEXT_PUBLIC_PLATFORM_HOST?.trim() || rootDomain,
    NEXT_PUBLIC_MARKETING_HOST: process.env.NEXT_PUBLIC_MARKETING_HOST?.trim() || rootDomain,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    GOOGLE_SERVICE_ACCOUNT_JSON: process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
    STORAGE_DEV_MODE: process.env.STORAGE_DEV_MODE,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  });
}