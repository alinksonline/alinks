/**
 * Tenant identity + industry gate for /api/create-order.
 * Public commerce must always resolve a business before creating Razorpay orders.
 */

export type CreateOrderIdentity = {
  handle?: string | null;
  businessId?: string | null;
};

export type CreateOrderGateResult =
  | { ok: true; handle?: string; businessId?: string }
  | { ok: false; error: string; code: "IDENTITY_REQUIRED" | "BUSINESS_NOT_FOUND" | "COMMERCE_BLOCKED"; status: number };

/** Require handle and/or businessId — never allow anonymous platform order creation. */
export function requireCreateOrderIdentity(input: CreateOrderIdentity): CreateOrderGateResult {
  const handle = input.handle?.trim() || undefined;
  const businessId = input.businessId?.trim() || undefined;

  if (!handle && !businessId) {
    return {
      ok: false,
      error: "Business identity required (handle or businessId)",
      code: "IDENTITY_REQUIRED",
      status: 400,
    };
  }

  return { ok: true, handle, businessId };
}
