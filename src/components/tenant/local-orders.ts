import type { CartItem } from "@/core/types/commerce";

export type SavedLocalOrder = {
  orderId: string;
  date: string;
  items: CartItem[];
  total: number;
  method: string;
  status: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
};

export function localOrdersKey(handle: string): string {
  return `alinks_orders_${handle}`;
}

export function readLocalOrders(handle: string): SavedLocalOrder[] {
  try {
    const raw = localStorage.getItem(localOrdersKey(handle));
    const parsed = raw ? (JSON.parse(raw) as SavedLocalOrder[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalOrder(handle: string, order: SavedLocalOrder): void {
  try {
    const existing = readLocalOrders(handle).filter((o) => o.orderId !== order.orderId);
    existing.unshift(order);
    localStorage.setItem(localOrdersKey(handle), JSON.stringify(existing.slice(0, 50)));
  } catch {
    /* ignore quota / private mode */
  }
}

export function patchLocalOrder(
  handle: string,
  orderId: string,
  patch: Partial<SavedLocalOrder>,
): void {
  try {
    const next = readLocalOrders(handle).map((o) => (o.orderId === orderId ? { ...o, ...patch } : o));
    localStorage.setItem(localOrdersKey(handle), JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export const CHECKOUT_CART_KEY = "alinks_checkout_cart";

export function stashCheckoutCart(handle: string, items: CartItem[]): void {
  try {
    sessionStorage.setItem(`${CHECKOUT_CART_KEY}_${handle}`, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function readStashedCart(handle: string): CartItem[] {
  try {
    const raw = sessionStorage.getItem(`${CHECKOUT_CART_KEY}_${handle}`);
    const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
