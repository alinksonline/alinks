"use client";

export type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayHandler = {
  open: () => void;
  on: (event: "payment.failed", handler: (response: { error: { description: string } }) => void) => void;
};

type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayHandler;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
let scriptPromise: Promise<void> | null = null;

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Razorpay runs in the browser only"));
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay")));
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout script"));
    document.body.appendChild(script);
  });

  return scriptPromise;
}

function formatIndianContact(contact?: string): string | undefined {
  if (!contact) return undefined;
  const digits = contact.replace(/\D/g, "");
  const local = digits.length > 10 ? digits.slice(-10) : digits;
  if (local.length !== 10) return undefined;
  return `+91${local}`;
}

export async function openRazorpayCheckout(options: {
  keyId: string;
  orderId: string;
  amountPaise: number;
  currency?: string;
  name: string;
  description: string;
  prefill?: { name?: string; contact?: string; email?: string };
  onSuccess: (response: RazorpaySuccessResponse) => void | Promise<void>;
  onDismiss?: () => void;
  onFailure?: (message: string) => void;
}): Promise<void> {
  await loadRazorpayScript();
  if (!window.Razorpay) throw new Error("Razorpay SDK not available");

  const formattedContact = formatIndianContact(options.prefill?.contact);

  const rzp = new window.Razorpay({
    key: options.keyId,
    amount: options.amountPaise,
    currency: options.currency ?? "INR",
    name: options.name,
    description: options.description,
    order_id: options.orderId,
    prefill: {
      ...options.prefill,
      email: options.prefill?.email ?? "test@alinks.online",
      ...(formattedContact ? { contact: formattedContact } : {}),
    },
    readonly: {
      contact: Boolean(formattedContact),
      name: Boolean(options.prefill?.name),
      email: true,
    },
    hidden: {
      contact: Boolean(formattedContact),
      email: true,
    },
    handler: (response: RazorpaySuccessResponse) => {
      void options.onSuccess(response);
    },
    modal: {
      ondismiss: () => options.onDismiss?.(),
    },
  });

  rzp.on("payment.failed", (response) => {
    options.onFailure?.(response.error.description ?? "Payment failed");
  });

  rzp.open();
}

export async function createOrderViaApi(
  amountPaise: number,
  receipt: string,
  opts: { handle?: string; businessId?: string },
): Promise<{
  order_id: string;
  amount: number;
  currency: string;
}> {
  if (!opts?.handle?.trim() && !opts?.businessId?.trim()) {
    throw new Error("Business identity required (handle or businessId)");
  }

  const res = await fetch("/api/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt,
      handle: opts.handle,
      businessId: opts.businessId,
    }),
  });

  const data = (await res.json()) as {
    order_id?: string;
    amount?: number;
    currency?: string;
    error?: string;
    code?: string;
  };
  if (!res.ok) throw new Error(data.error ?? "Could not create order");
  if (!data.order_id) throw new Error("Invalid order response");

  return {
    order_id: data.order_id,
    amount: data.amount ?? amountPaise,
    currency: data.currency ?? "INR",
  };
}

export async function verifyPaymentViaApi(payload: Record<string, unknown>): Promise<{
  success: boolean;
  verified?: boolean;
  orderId?: string;
  bookingId?: string;
  error?: string;
}> {
  const res = await fetch("/api/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as {
    success?: boolean;
    verified?: boolean;
    orderId?: string;
    bookingId?: string;
    error?: string;
  };

  if (!res.ok) {
    return { success: false, error: data.error ?? "Payment verification failed" };
  }

  return {
    success: true,
    verified: data.verified,
    orderId: data.orderId,
    bookingId: data.bookingId,
  };
}