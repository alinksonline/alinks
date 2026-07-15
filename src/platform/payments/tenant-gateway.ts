import { eq } from "drizzle-orm";
import { getPlatformDb } from "@/platform/db/client";
import { businesses } from "@/platform/db/schema";
import { decryptSecret } from "@/platform/payments/secret-box";
import type { RazorpayCredentials } from "@/platform/payments/razorpay";

export type TenantGatewayStatus = {
  connected: boolean;
  keyId: string | null;
  connectedAt: Date | null;
};

/** Public status for dashboard (never includes secret). */
export async function getTenantGatewayStatus(businessId: string): Promise<TenantGatewayStatus> {
  const db = getPlatformDb();
  if (!db) return { connected: false, keyId: null, connectedAt: null };
  const row = (
    await db
      .select({
        keyId: businesses.razorpayKeyId,
        secretEnc: businesses.razorpayKeySecretEnc,
        connectedAt: businesses.razorpayConnectedAt,
      })
      .from(businesses)
      .where(eq(businesses.id, businessId))
      .limit(1)
  )[0];
  if (!row?.keyId || !row.secretEnc) {
    return { connected: false, keyId: null, connectedAt: null };
  }
  return {
    connected: true,
    keyId: row.keyId,
    connectedAt: row.connectedAt,
  };
}

/** Load decrypted tenant Razorpay credentials for server-side order/verify only. */
export async function getTenantRazorpayCredentials(
  businessId: string,
): Promise<RazorpayCredentials | null> {
  const db = getPlatformDb();
  if (!db) return null;
  const row = (
    await db
      .select({
        keyId: businesses.razorpayKeyId,
        secretEnc: businesses.razorpayKeySecretEnc,
      })
      .from(businesses)
      .where(eq(businesses.id, businessId))
      .limit(1)
  )[0];
  if (!row?.keyId || !row.secretEnc) return null;
  try {
    const keySecret = decryptSecret(row.secretEnc);
    return { keyId: row.keyId, keySecret };
  } catch {
    return null;
  }
}

export function businessHasOnlinePay(row: {
  razorpayKeyId?: string | null;
  razorpayKeySecretEnc?: string | null;
}): boolean {
  return Boolean(row.razorpayKeyId && row.razorpayKeySecretEnc);
}
